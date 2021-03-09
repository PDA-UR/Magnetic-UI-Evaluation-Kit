import bottle
from bottle import route, run, request, template, TEMPLATE_PATH, static_file, response
import csv
from csv import reader
from csv import writer
import threading
import nbformat
import shutil, sys, os
from nbconvert.preprocessors import ExecutePreprocessor

if __name__ == '__main__':
    log_path = './logs/'
    finished_log_path = './logs/finishedLogs/'
    failed_log_path = './logs/failedLogs/'
    notebook_filename = "MUI_Test_Evaluation.ipynb"

    def enable_cors(fn):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

            if bottle.request.method != 'OPTIONS':
                # actual request; reply with the actual response
                return fn(*args, **kwargs)
        return _enable_cors

    @route("/registerPID/", method='POST')
    @enable_cors
    def register_PID():
        register_data = request.body.getvalue().decode('utf-8')
        register_values = []
        register_values.append(register_data.split(','))
        print(register_values[0][3])

        with open('pidList.csv', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            maxID = -1

            for row in reader:
                maxID += 1
                print(register_values[0][3])
                if row['uniqueBrowserID'] == register_values[0][3]:
                    if row['hasFinished'] == str(0):
                        failed_pid = row['ID']
                        for x in range(6):
                            file_path = log_path + failed_pid + '-' + str(x) + ".csv"
                            if os.path.isfile(file_path):
                                shutil.move(file_path,failed_log_path + failed_pid + '-' + str(x) + ".csv")
                        print("re play: " + str(maxID))
                        return str(maxID)
                    else:
                        return "f1"
            with open("pidList.csv", "a") as csvfile:
                id = maxID + 1
                writer = csv.writer(csvfile, delimiter=',')
                writer.writerow([register_values[0][0],register_values[0][1],register_values[0][2],id,0,register_values[0][3],register_values[0][4]])
                return str(id)
        

    @route("/log/", method="POST")
    def log():
        log_data = request.body.getvalue().decode('utf-8')
        lines = log_data.splitlines()
        rows = []
        for row in lines:
            rows.append(row.split(","))

        pid = rows[1][1]
        condition_id = rows[1][2]
        run_id = rows[1][3]

        # Write csv data to file
        log_file = open(log_path + pid + "-" + condition_id + ".csv", "a")
        log_file.write(log_data)
        log_file.close()

    @route("/logFinish/", method='POST')
    def log_finish():
        pid_finished = request.body.getvalue().decode('utf-8')
        print(pid_finished)

        # Move Files to finishedLogs Folder
        for x in range(6):
            file_path = log_path + pid_finished + '-' + str(x) + ".csv"
            if os.path.isfile(file_path):
                shutil.move(file_path,finished_log_path + pid_finished+ '-' + str(x) + "-f" + ".csv")
  
        # Update PID list hasFinished
        f = open('/Users/alexweichart/Documents/GitHub/Magnetic-UI-Evaluation-Kit/server/pidList.csv', "r+")
        line_to_update = int(pid_finished) + 1
        with f:
            r = csv.reader(f) 
            split = list(r)
            split[line_to_update][4] = '1'
            writer = csv.writer(f)
            f.seek(0)
            writer.writerows(split)
            f.truncate()
            f.close()



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

