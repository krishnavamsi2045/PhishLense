import ssl
import socket
from datetime import datetime


def check_ssl(hostname):

    try:

        context = ssl.create_default_context()

        with socket.create_connection(
            (hostname, 443),
            timeout=5,
        ) as sock:

            with context.wrap_socket(
                sock,
                server_hostname=hostname,
            ) as ssock:

                cert = ssock.getpeercert()

        expiry = datetime.strptime(
            cert["notAfter"],
            "%b %d %H:%M:%S %Y %Z"
        )

        days_left = (
            expiry - datetime.utcnow()
        ).days

        return {
            "valid": True,
            "days_left": days_left,
        }

    except Exception as e:

        return {
            "valid": False,
            "error": str(e),
        }