/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSubscribersByHashes } from '../db/tables/subscribers.js'
import {
  getBreachByName,
  getAddressesAndLanguageForEmail,
  loadBreachesIntoApp
} from '../utils/hibp.js'

import { acceptedLanguages, negotiateLanguages } from '@fluent/langneg'

import { getEmailAddressesByHashes } from '../db/tables/email_addresses.js'
import { getTemplate } from '../views/emails/email-2022.js'
import { breachAlertEmailPartial } from '../views/emails/email-breach-alert.js'

import {
  EmailTemplateType,
  getEmailCtaHref,
  sendEmail
} from '../utils/email.js'
import { getMessage } from '../utils/fluent.js'

import mozlog from '../utils/log.js'

const log = mozlog('controllers.hibp')

async function notifyWorker (req, res) {
  const { breachName, hashPrefix, hashSuffixes } = req.body

  let breachAlert = getBreachByName(req.app.locals.breaches, breachName)

  if (!breachAlert) {
    // If breach isn't found, try to reload breaches from HIBP
    console.debug('notify', 'Breach is not found, reloading breaches...')
    await loadBreachesIntoApp(req.app)
    breachAlert = getBreachByName(req.app.locals.breaches, breachName)
    if (!breachAlert) {
      // If breach *still* isn't found, we have a real error
      throw new Error('Unrecognized breach: ' + breachName)
    }
  }

  const { IsVerified, Domain, IsFabricated, IsSpamList } = breachAlert

  // If any of the following conditions are not satisfied:
  // Do not send the breach alert email! The `logId`s are being used for
  // logging in case we decide to not send the alert.
  const emailDeliveryConditions = [
    {
      logId: 'isNotVerified',
      condition: !IsVerified
    },
    {
      logId: 'domainEmpty',
      condition: Domain === ''
    },
    {
      logId: 'isFabricated',
      condition: IsFabricated
    },
    {
      logId: 'isSpam',
      condition: IsSpamList
    }
  ]

  const unsatisfiedConditions = emailDeliveryConditions.filter(condition => (
    condition.condition
  ))

  const doNotSendEmail = unsatisfiedConditions.length > 0

  if (doNotSendEmail) {
    // Get a list of the failed condition `logId`s
    const conditionLogIds = unsatisfiedConditions
      .map(condition => condition.logId)
      .join(', ')

    log.info('Breach alert email was not sent.', {
      name: breachAlert.Name,
      reason: `The following conditions were not satisfied: ${conditionLogIds}.`
    })

    return res.status(200).json({
      info: 'Breach loaded into database. Subscribers not notified.'
    })
  }
  try {
    const reqHashPrefix = hashPrefix.toLowerCase()
    const hashes = hashSuffixes.map(suffix => reqHashPrefix + suffix.toLowerCase())
    const subscribers = await getSubscribersByHashes(hashes)
    const emailAddresses = await getEmailAddressesByHashes(hashes)
    const recipients = subscribers.concat(emailAddresses)

    log.info(EmailTemplateType.Notification, {
      breachAlertName: breachAlert.Name,
      length: recipients.length
    })

    const utmCampaignId = 'breach-alert'
    const notifiedRecipients = []

    for (const recipient of recipients) {
      log.info('notify', { recipient })
      // Get subscriber ID from:
      // - `subscriber_id`: if `email_addresses` record
      // - `id`: if `subscribers` record
      const subscriberId = recipient.subscriber_id ?? recipient.id
      const {
        recipientEmail,
        breachedEmail,
        signupLanguage
      } = getAddressesAndLanguageForEmail(recipient)

      const requestedLanguage = signupLanguage
        ? acceptedLanguages(signupLanguage)
        : []
      const availableLanguages = req.app.locals.AVAILABLE_LANGUAGES
      const supportedLocales = negotiateLanguages(
        requestedLanguage,
        availableLanguages,
        { defaultLocale: 'en' }
      )
      if (!notifiedRecipients.includes(breachedEmail)) {
        const data = {
          breachData: breachAlert,
          breachLogos: req.app.locals.breachLogoMap,
          breachedEmail,
          ctaHref: getEmailCtaHref(utmCampaignId, 'dashboard-cta'),
          heading: getMessage('email-spotted-new-breach'),
          // Override recipient if explicitly set in req
          recipientEmail: req.body.recipient ?? recipientEmail,
          subscriberId,
          supportedLocales,
          utmCampaign: utmCampaignId
        }

        const emailTemplate = getTemplate(data, breachAlertEmailPartial)
        const subject = getMessage('breach-alert-subject')

        await sendEmail(data.recipientEmail, subject, emailTemplate)

        notifiedRecipients.push(breachedEmail)
      }
    }

    log.info('notified', { length: notifiedRecipients.length })

    res
      .status(200)
      .json({
        info: 'Notified subscribers of breach.'
      })
  } catch (error) {
    throw new Error(`Notifying subscribers of breach failed: ${error}`)
  }
}

export { notifyWorker }
