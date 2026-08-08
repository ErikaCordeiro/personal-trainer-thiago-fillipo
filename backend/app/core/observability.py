import contextvars
import os


request_id_context: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")


def build_identity() -> dict[str, str]:
    commit = os.getenv("RAILWAY_GIT_COMMIT_SHA") or os.getenv("SOURCE_VERSION") or "unknown"
    return {
        "environment": os.getenv("RAILWAY_ENVIRONMENT_NAME") or os.getenv("ENVIRONMENT") or "development",
        "version": commit[:12] if commit != "unknown" else commit,
        "deployment": (os.getenv("RAILWAY_DEPLOYMENT_ID") or "unknown")[:12],
    }


def request_id() -> str:
    return request_id_context.get()
