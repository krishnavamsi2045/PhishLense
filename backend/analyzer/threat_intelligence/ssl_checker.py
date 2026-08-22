import ssl
import socket
from datetime import datetime


def check_ssl(domain):

    try:

        context = (
            ssl.create_default_context()
        )

        with context.wrap_socket(
            socket.socket(),
            server_hostname=domain,
        ) as sock:

            sock.settimeout(5)

            sock.connect(
                (domain, 443)
            )

            cert = (
                sock.getpeercert()
            )

        expiry = datetime.strptime(
            cert["notAfter"],
            "%b %d %H:%M:%S %Y %Z",
        )

        days_left = (
            expiry -
            datetime.utcnow()
        ).days

        return {

            "valid": True,

            "issuer":
                dict(
                    x[0]
                    for x in cert["issuer"]
                ),

            "days_left":
                days_left,
        }

    except Exception as error:

        return {

            "valid": False,

            "error": str(error),
        }