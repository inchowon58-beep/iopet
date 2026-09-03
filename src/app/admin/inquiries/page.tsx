import type { Metadata } from "next";
import InquiryAdmin from "../InquiryAdmin";

export const metadata: Metadata = {
  title: "분양문의",
  robots: { index: false, follow: false },
};

export default function AdminInquiriesPage() {
  return <InquiryAdmin />;
}
