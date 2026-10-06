import { createFileRoute } from "@tanstack/react-router";
import fs from "fs";
import path from "path";

export const Route = createFileRoute("/api/admin/backup-status")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const manifestPath = path.resolve("./public/backups/latest-backup-manifest.json");
          if (fs.existsSync(manifestPath)) {
            const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            return Response.json({ success: true, manifest: data });
          }
          return Response.json({ success: false, message: "No backup manifest found yet." });
        } catch (e: any) {
          return Response.json({ success: false, error: e.message }, { status: 500 });
        }
      },
    },
  },
});
