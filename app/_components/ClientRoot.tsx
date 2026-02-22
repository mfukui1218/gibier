"use client";

import DebugClientError from "./DebugClientError";
import RegisterServiceWorker from "./RegisterServiceWorker";

export default function ClientRoot() {
  return (
    <>
      <DebugClientError />
      <RegisterServiceWorker />
    </>
  );
}
