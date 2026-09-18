import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/send-notification")({
  server: {
    handlers: {
      POST: async () => {
        return Response.json({ success: true, message: "Notification sent successfully (stub)" });
      },
    },
  },
});
