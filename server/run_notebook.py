import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
notebook_filename = "MUI_Test_Evaluation.ipynb"
log_path = './logs/'
with open(log_path + notebook_filename) as f:
    nb = nbformat.read(f, as_version=4)
    ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
    ep.preprocess(nb, {'metadata': {'path': log_path}})
    with open(log_path + notebook_filename, 'w', encoding='utf-8') as f:
        nbformat.write(nb, f)
