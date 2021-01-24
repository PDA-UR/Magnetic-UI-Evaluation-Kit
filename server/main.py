from bottle import route, run, request, template, TEMPLATE_PATH, static_file
import csv
import threading

if __name__ == '__main__':
    
    @route("/log/", method="POST")
    def log():
        log_data = request.body.getvalue().decode('utf-8')
        lines = log_data.splitlines()
        rows = []
        for row in lines:
            rows.append(row.split(","))

        pid = rows[1][1]
        condition_id = rows[1][2]

        log_file = open(pid + "-" + condition_id + ".csv", "a")
        log_file.write(log_data)
        log_file.close()

    @route("/")
    def server_static():
        return static_file("index.html", root='./app/')

    @route('/res/<filename>')
    def server_static(filename):
        return static_file(filename, root='./app/res')

    @route('/res/js/<filename>')
    def server_static(filename):
        return static_file(filename, root='./app/res/js')

    @route('/res/jsonConfigFiles/<filename>')
    def server_static(filename):
        return static_file(filename, root='./app/res/jsonConfigFiles')

        
    threading.Thread(target=run(host="localhost", port=3333, debug=False)).start()

