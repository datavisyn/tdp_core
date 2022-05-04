__author__ = "Samuel Gratzl"

if __name__ == "__main__":
    import hashlib
    import uuid

    password = input("enter password: ").encode("utf-8")
    salt = uuid.uuid4().hex.encode("utf-8")
    hashed_password = hashlib.sha512(password + salt).hexdigest()
    print(password)
    print(salt)
    print(hashed_password)
