import { getGlobalSponsor } from "@/lib/site-sponsor";
import SponsorStickyFooterBar from "./SponsorStickyFooterBar";

export default async function SponsorStickyFooter() {
  const sponsor = await getGlobalSponsor();
  return <SponsorStickyFooterBar sponsor={sponsor} />;
}
