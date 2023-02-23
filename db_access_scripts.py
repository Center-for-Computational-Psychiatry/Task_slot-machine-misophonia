import sqlite3
import pandas as pd
from IPython.display import display
from glob import glob; from os.path import expanduser
from datetime import date

# root_dir = '/Users/janet/Desktop/Sinai_Projects/Code/'
root_dir = '/Users/alissachen/Documents/Github/'
# project_dir = 'Task_slot-machine-misophonia/website' # Janet's db directory
project_dir = 'Task_slot-machine-misophonia/instance' # Alissa's db directory

# Convert database SQL query --> pandas dataframe
con = sqlite3.connect(f'{root_dir}/{project_dir}/database-misophonia.sqlite')

all_tables = pd.read_sql_query("SELECT * from sqlite_master", con)
participant_data = pd.read_sql_query("SELECT * from participant", con)
task_data = pd.read_sql_query("SELECT * from task_data", con)

# Verify that result of SQL query is stored in the dataframe
display(all_tables)
display(participant_data)
display(task_data)

# Get current date time object
# https://www.programiz.com/python-programming/datetime/strftime
current_date = date.today().strftime("%m-%d-%Y")

# Convert dataframes --> CSV file
# https://www.alixaprodev.com/2022/04/sqlite-database-to-csv-file-in-python.html#:~:text=The%20Best%20way%20to%20convert%20any%20Sqlite%20database%20to%20CSV,file%20using%20the%20pandas%20module.
participant_data.to_csv('data/miso_participant_data_'+current_date+'.csv', index=False)
task_data.to_csv('data/miso_task_data_'+current_date+'.csv', index=False)
# trigger_data.to_csv('misophonia_trigger_data.csv', index=False)

con.close()
