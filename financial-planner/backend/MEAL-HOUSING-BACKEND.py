# RYAN BROWN, TEAM FARHAN (Team F)
# Format source: https://matplotlib.org/stable/gallery/lines_bars_and_markers/bar_stacked.html
# 3/25 ON CAMPUS MEAL HOUSING VERSUS OFF CAMPUS COMPARISON BACKEND PROGRAM

import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64



# input housing/meal costs and returns a base64 png matplotlib graph

bar_labels = (
    "Single Housing & Basic Meal",
    "Single Housing & Flex Meal",
    "Double Housing & Basic Meal",
    "Double Housing & Flex Meal"
)
weight_counts = {
    "Housing Cost": np.array([4428, 4428, 3477, 3477]),
    "Meal Cost": np.array([3430, 3580, 3430, 3580])
}
    
width = 0.4

fig, ax = plt.subplots()
bottom =  np.zeros(4)

for boolean, weight_count in weight_counts.items():
    p = ax.bar(bar_labels, weight_count, width, label=boolean, bottom=bottom)
    bottom += weight_count

ax.set_title("Comparison of Semesterly Housing & Meal for Students at U'Maine Orono")
ax.legend(loc="upper right")

# Save plot to buffer
buf = BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)
plt.show()
plt.close()

# Encode buffer base64
data_uri = base64.b64encode(buf.read()).decode('utf-8')
img_data = f'data:image/png;base64,{data_uri}'





