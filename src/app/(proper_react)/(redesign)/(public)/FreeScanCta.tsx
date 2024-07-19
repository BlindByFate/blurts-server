/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { signIn } from "next-auth/react";
import { useCookies } from "react-cookie";
import { Props, SignUpForm } from "./SignUpForm";
import { TelemetryButton } from "../../../components/client/TelemetryButton";
import { modifyAttributionsForUrlSearchParams } from "../../../functions/universal/attributions";
import { ExperimentData } from "../../../../telemetry/generated/nimbus/experiments";
import { useL10n } from "../../../hooks/l10n";
import { WaitlistCta } from "./ScanLimit";
import { useViewTelemetry } from "../../../hooks/useViewTelemetry";
import { RefObject } from "react";

export function getAttributionSearchParams({
  cookies,
  emailInput,
  experimentData,
}: {
  cookies: {
    attributionsFirstTouch?: string;
  };
  emailInput?: string;
  experimentData?: ExperimentData;
}) {
  const attributionSearchParams = modifyAttributionsForUrlSearchParams(
    new URLSearchParams(cookies.attributionsFirstTouch),
    {
      entrypoint: "monitor.mozilla.org-monitor-product-page",
      form_type: typeof emailInput === "string" ? "email" : "button",
      ...(emailInput && { email: emailInput }),
      ...(experimentData &&
        experimentData["landing-page-free-scan-cta"].enabled && {
          entrypoint_experiment: "landing-page-free-scan-cta",
          entrypoint_variation:
            experimentData["landing-page-free-scan-cta"].variant,
        }),
    },
    {
      utm_source: "product",
      utm_medium: "monitor",
      utm_campaign: "get_free_scan",
    },
  );

  return attributionSearchParams.toString();
}

export const FreeScanCta = (
  props: Props & {
    experimentData: ExperimentData;
  },
) => {
  const l10n = useL10n();
  const [cookies] = useCookies(["attributionsFirstTouch"]);
  const telemetryButtonId = `${props.eventId.cta}-${props.experimentData["landing-page-free-scan-cta"].variant}`;
  const refViewTelemetry = useViewTelemetry("ctaButton", {
    button_id: telemetryButtonId,
  });
  if (
    !props.experimentData["landing-page-free-scan-cta"].enabled ||
    props.experimentData["landing-page-free-scan-cta"].variant ===
      "ctaWithEmail"
  ) {
    return (
      <SignUpForm
        scanLimitReached={props.scanLimitReached}
        isHero={props.isHero}
        eligibleForPremium={props.eligibleForPremium}
        signUpCallbackUrl={props.signUpCallbackUrl}
        eventId={props.eventId}
        experimentData={props.experimentData}
      />
    );
  }

  return props.scanLimitReached ? (
    <WaitlistCta />
  ) : (
    <div>
      <TelemetryButton
        buttonRef={refViewTelemetry as unknown as RefObject<HTMLButtonElement>}
        variant="primary"
        event={{
          module: "ctaButton",
          name: "click",
          data: {
            button_id: telemetryButtonId,
          },
        }}
        onPress={() => {
          void signIn(
            "fxa",
            { callbackUrl: props.signUpCallbackUrl },
            getAttributionSearchParams({
              cookies,
              experimentData: props.experimentData,
            }),
          );
        }}
      >
        {l10n.getString(
          props.experimentData["landing-page-free-scan-cta"].variant ===
            "ctaOnly"
            ? "landing-all-hero-emailform-submit-label"
            : "landing-all-hero-emailform-submit-sign-in-label",
        )}
      </TelemetryButton>
    </div>
  );
};
