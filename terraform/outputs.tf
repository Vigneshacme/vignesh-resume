output "hosting_url" {
  description = "The auto-generated default Firebase Hosting URL"
  value       = "https://${google_firebase_hosting_site.default.site_id}.web.app"
}

output "firestore_database_name" {
  description = "The Firestore database name"
  value       = google_firestore_database.database.name
}
