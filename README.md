

# PrismaPub

Web app + admin panel for events, ticket sales, gallery, and promotional banners.

## Local Development

Prerequisites: Node.js 18+

1. Install dependencies: `npm install`
2. Configure environment variables (see section below)
3. Run the app: `npm run dev`

## Environment Variables

The backend reads environment variables directly from the process environment (Docker Compose/Coolify recommended in production).

- `ADMIN_PASSWORD`: Initial admin password used only when the DB is first initialized.
- `JWT_SECRET`: Active JWT signing secret. Required in production.
- `JWT_SECRET_PREVIOUS`: Previous JWT secret accepted for token verification during key rotation.

### JWT Rotation

To rotate JWT secrets without instantly logging out active admin sessions:

1. Set current secret in `JWT_SECRET`.
2. Move old secret to `JWT_SECRET_PREVIOUS`.
3. Deploy.
4. After old tokens expire, remove `JWT_SECRET_PREVIOUS`.

Security note: Always use long random values for JWT secrets in production.

## Deployment

This project includes `Dockerfile` and `docker-compose.yaml` for container deployment (for example, Coolify).
