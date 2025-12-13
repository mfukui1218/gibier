"use client";
import NotificationBellGate from "./notifications/NotificationBellGate";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import SaveAdminFcmToken from "./notifications/SaveAdminFcmToken";

export default function ClientProviders() {
  return (
    <>
      <NotificationBellGate />
      <ServiceWorkerRegister />
      <SaveAdminFcmToken />
    </>
  );
}
