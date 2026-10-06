from flask import Flask, render_template, request

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        print("Login attempt:", email)

        return f"Login received for {email}"

    return render_template("login.html")


if __name__ == "__main__":
    app.run(debug=True)