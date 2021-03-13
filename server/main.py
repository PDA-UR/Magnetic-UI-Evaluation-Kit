import bottle
import time
from bottle import route, run, request, template, TEMPLATE_PATH, static_file, response
import csv
from csv import reader
from csv import writer
import threading
import random, string
import nbformat
import asyncio
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

    @route("/registerPID/", method=['POST', 'OPTIONS'])
    def register_PID():
        print("Pid call recieved " + str(time.time()))
        register_data = request.body.getvalue().decode('utf-8')
        register_values = []
        register_values.append(register_data.split(','))

        with open('pidList.csv', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            maxID = -1

            for row in reader:
                maxID += 1
                if row['uniqueBrowserID'] == register_values[0][3]:
                    if row['hasFinished'] == str(0):
                        failed_pid = row['ID']
                        for x in range(9):
                            conditionName = str(x)
                            if x == 7:
                                conditionName = "warmup"
                            elif x == 8:
                                conditionName = "cooldown"
                            
                            file_path = log_path + failed_pid + '-' + conditionName + ".csv"
                            if os.path.isfile(file_path):
                                shutil.move(file_path,failed_log_path + failed_pid + '-' + conditionName + ".csv")
                        print("Found existing PID in list" + str(time.time()))
                        return str(maxID)
                    else:
                        return "f1"
            print("No existing pid found in list " + str(time.time()))
            with open("pidList.csv", "a") as csvfile:
                id = maxID + 1
                writer = csv.writer(csvfile, delimiter=',')
                writer.writerow([register_values[0][0],register_values[0][1],register_values[0][2],id,0,register_values[0][3],register_values[0][4]])
                print("New PID written to list " + str(time.time()))
                return str(id)
        

    @route("/log/", method="POST")
    def log():
        asyncio.run(saveLog(request))

    async def saveLog(request):
        print("Log recieved " + str(time.time()))
        log_data = request.body.getvalue().decode('utf-8')
        lines = log_data.splitlines()
        rows = []
        for row in lines:
            rows.append(row.split(","))

        pid = rows[1][1]
        condition_id = rows[1][2]
        run_id = rows[1][3]

        if condition_id == "-1":
            condition_id = "warmup"
        elif condition_id == "6":
            condition_id = "cooldown"
        print("condition fetched " + str(time.time()))

        log_file = open(log_path + pid + "-" + condition_id + ".csv", "a")
        log_file.write(log_data)
        log_file.close()
        
        print("written to csv " + str(time.time()))

        
    @route("/logFinish/", method=['POST', 'OPTIONS'])
    def log_finish():
        pid_finished = request.body.getvalue().decode('utf-8')

        # Move Files to finishedLogs Folder
        for x in range(9):

            conditionName = str(x)

            if x == 7:
                conditionName = "warmup"
            elif x == 8:
                conditionName = "cooldown"
                
            file_path = log_path + pid_finished + '-' + conditionName + ".csv"

            if os.path.isfile(file_path):
                shutil.move(file_path,finished_log_path + pid_finished+ '-' + conditionName + "-f" + ".csv")
  
        # Update PID list hasFinished
        f = open('pidList.csv', "r+")
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
            
        h = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
            
        with open("finishedHashes.csv", "a") as csvfile:
            csvfile.write("\n" + str(h))
            csvfile.close
        return str(h)
        

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

        
    threading.Thread(target=run(host="localhost", port=7000, debug=False)).start()

