# CI Secrets Checklist

Current pipeline does not require mandatory secrets for basic execution.

## Optional Secrets

- `SLACK_WEBHOOK_URL`
  - Use for failure notifications in a later notification step.
- `CI_STATUS_EMAIL`
  - Optional for email-based alert integrations.

## If GHIN/Weather Integrations Are Added Later

Add these only when corresponding code is introduced:

- `GHIN_API_KEY` (or equivalent credential)
- `USGA_DATA_TOKEN` (if licensed API access is used)
- `WEATHER_API_KEY`

## Security Rules

- Never hardcode credentials in workflow YAML.
- Store all sensitive values in GitHub Actions secrets.
- Rotate keys periodically and after team membership changes.
