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

    @route("/registerPID/", method=['POST', 'OPTIONS'])
    def register_PID():
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
                        for x in range(5):
                            conditionName = str(x)
                            file_path = log_path + failed_pid + '-' + conditionName + ".csv"
                            if os.path.isfile(file_path):
                                shutil.move(file_path,failed_log_path + failed_pid + '-' + conditionName + ".csv")
                        csvfile.close()
                        return str(maxID)
                    else:
                        csvfile.close()
                        return "f1"
        with open("pidList.csv", "a") as csvfile:
            id = maxID + 1
            writer = csv.writer(csvfile, delimiter=',')
            writer.writerow([register_values[0][0],register_values[0][1],register_values[0][2],id,0,register_values[0][3],register_values[0][4]])
            csvfile.close()
            return str(id)
        

    @route("/log/", method="POST")
    def log():
        asyncio.run(saveLog(request))
        if len(request.body.getvalue().decode('utf-8')) > 500:
            return "200"
        

    async def saveLog(request):
        log_data = request.body.getvalue().decode('utf-8')
        lines = log_data.splitlines()
        rows = []
        for row in lines:
            rows.append(row.split(","))

        pid = rows[1][1]
        condition_id = rows[1][2]
        run_id = rows[1][3]

        log_file = open(log_path + pid + "-" + condition_id + ".csv", "a")
        log_file.write(log_data)
        log_file.close()

        
    @route("/logFinish/", method=['POST', 'OPTIONS'])
    def log_finish():
        pid_finished = request.body.getvalue().decode('utf-8')

        # Move Files to finishedLogs Folder
        for x in range(5):
            conditionName = str(x)
                
            file_path = log_path + pid_finished + '-' + conditionName + ".csv"

            if os.path.isfile(file_path):
                shutil.move(file_path,finished_log_path + pid_finished+ '-' + conditionName + "-f" + ".csv")
  
            
        h = ''.join(random.choices(string.ascii_letters + string.digits, k=16))

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

