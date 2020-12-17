from bottle import route, run, request, template


if __name__ == '__main__':
    @route("/log/", method="POST")
    def log():
        payload = request.json

        print(payload)

    @route("/")
    def index():
        return template("index.html", request=request)

    run(host="localhost", port=3333, debug=False)