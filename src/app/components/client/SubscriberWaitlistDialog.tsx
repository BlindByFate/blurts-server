/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { useRef } from "react";
import Image from "next/image";
import { useOverlayTrigger } from "react-aria";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "./Button";
import { Dialog } from "./dialog/Dialog";
import { ModalOverlay } from "./dialog/ModalOverlay";
import ModalImage from "../client/assets/subscriber-waitlist-dialog-icon.svg";
import { useL10n } from "../../hooks/l10n";
import styles from "./SubscriberWaitlistDialog.module.scss";

function SubscriberWaitlistDialog() {
  const l10n = useL10n();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerState = useOverlayTriggerState({});
  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: "dialog" },
    dialogTriggerState,
    triggerRef,
  );

  return (
    <>
      <Button ref={triggerRef} variant={"primary"} small {...triggerProps}>
        {l10n.getString(
          "dashboard-top-banner-monitor-protects-your-even-more-cta",
        )}
      </Button>
      {dialogTriggerState.isOpen && (
        <ModalOverlay
          {...overlayProps}
          state={dialogTriggerState}
          isDismissable={true}
        >
          <Dialog
            title={l10n.getString("subscriber-waitlist-dialog-title")}
            illustration={<Image src={ModalImage} alt="" />}
            onDismiss={() => dialogTriggerState.close()}
          >
            <div className={styles.dialogContent}>
              {l10n.getString("subscriber-waitlist-dialog-info-text")}
              <br />
              <br />
              {l10n.getString("subscriber-waitlist-dialog-instruction-text")}

              <div className={styles.buttonWrapper}>
                <Button variant="primary" onPress={() => {}}>
                  {l10n.getString(
                    "subscriber-waitlist-dialog-cta-button-label",
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => dialogTriggerState.close()}
                >
                  {l10n.getString(
                    "subscriber-waitlist-dialog-skip-button-label",
                  )}
                </Button>
              </div>
            </div>
          </Dialog>
        </ModalOverlay>
      )}
    </>
  );
}

export { SubscriberWaitlistDialog };
