import sqlite3
import pandas as pd
from IPython.display import display

root_dir = '/Users/janet/Desktop/Sinai_Projects/Code/'
project_dir = 'task_slot-machine-misophonia/website'
# project_dir = 'miso_app_prechange'

# Read sqlite query results into a pandas DataFrame
con = sqlite3.connect(f'{root_dir}/{project_dir}/database-misophonia.sqlite')
# con = sqlite3.connect(f'{root_dir}/{project_dir}/database-drug-craving.sqlite')

all_tables = pd.read_sql_query("SELECT * from sqlite_master", con)
df_summary = pd.read_sql_query("SELECT * from participant", con)
df_longform = pd.read_sql_query("SELECT * from task_data", con)
df_triggers = pd.read_sql_query("SELECT * from trigger_data", con)

# pd.set_option('display.max_rows', 1000)
# pd.set_option('display.max_columns', 1000)
# pd.set_option('display.width', 1000)

# Verify that result of SQL query is stored in the dataframe
display(all_tables)
display(df_summary)
display(df_longform)
display(df_triggers)

# display(all_tables)
con.close()
