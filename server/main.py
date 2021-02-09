from bottle import route, run, request, template, TEMPLATE_PATH, static_file
import csv
import threading
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
if __name__ == '__main__':
    log_path = './logs/'
    notebook_filename = "MUI_Test_Evaluation.ipynb"

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
  
        # Restart and run all cells
        with open(log_path + notebook_filename) as f:
            nb = nbformat.read(f, as_version=4)

        ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
        ep.preprocess(nb, {'metadata': {'path': log_path}})
        with open(log_path + notebook_filename, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)



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

