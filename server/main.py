from bottle import route, run, request, template, TEMPLATE_PATH, static_file
import csv
import threading

if __name__ == '__main__':
    log_file = open("log.csv", "a")
    logger = csv.writer(log_file, delimiter=";")

    @route("/log/", method="POST")
    def log():
        log_data = request.json["data"]
        logger.writerow([log_data["pid"], log_data["timestamp"], log_data["condition"]])
        log_file.flush()

    @route("/")
    def server_static():
        return static_file("index.html", root='./app/')

    @route('/res/<filename>')
    def server_static(filename):
        return static_file(filename, root='./app/res')

    @route('/res/js/<filename>')
    def server_static(filename):
        return static_file(filename, root='./app/res/js')

    threading.Thread(target=run(host="localhost", port=3333, debug=False)).start()

