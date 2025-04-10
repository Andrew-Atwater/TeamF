# TeamF (Team Farhan)
COS420 Financial Organization Project

https://farhan-financial-planner.web.app/

Starting the environment:
1) Open VScode or cmd and get into a command prompt
2) Create a new directory such as *mkdir cos420project*
3) Change into directory using cd. Such as *cd cos420project*
4) Clone this directory. *git clone https://github.com/Andrew-Atwater/TeamF.git*
5) Change into the TeamF directory. *cd TeamF*
6) Change into the financial-planner directory. *cd financial-planner*
7) Install all the required dependencies. *npm install* -- May take a few minutes
8) Using https://video.maine.edu/media/Setting%20Up%20Firebase/1_0kgpvmqm, set up a firebase-config.tsx following the layout in the firebase-config.tsx.disp file. *Make sure to select the firebase database and authenticator emulators for local machines*
9) Choose either to host on the local machine or the web
10.1a) *local machine*
10.2a) Start the firebase emulators. *firebase emulators:start*
10.3a)Use *npm start* -- It may take a few minutes, but can access the webpage from the browser using localhost:3000
10.1b) *web hosting*
10.2b) Run production build. *npm run build*
10.3b) Deploy the webpage. *firebase deploy* 

MEMBERS:
1) Adam Bendetson (Project Manager)
2) Farhan Omane (Designer)
3) Dylan Alvord (Developer #1)
4) Ryan Brown (Developer #2)
5) Andrew Atwater (Developer #3)
6) Alex Picard (Developer #4)

KANBAN CHART:
https://app.worklenz.com/worklenz/projects/dc561aac-27a0-44bf-a70a-ffdb54e8f674?tab=tasks-list&pinned_tab=tasks-list

SYSTEM REQUIREMENT SPECIFICATION DOCUMENT:
https://docs.google.com/document/d/1bMdSQifJXM5QYvslw5x0TamEnEZmEueSToP99LMPEZM/edit?tab=t.0

NON-FUNCTIONAL/FUNCTIONAL REQUIREMENTS DOCUMENT:
https://docs.google.com/document/d/1O-iKiveWH0owMYvlDRei5z7f5wiFRJXMLq1TQ0pnisY/edit?tab=t.0

SYSTEM ARCHITECTURE DESIGN DOCUMENT:
https://docs.google.com/document/d/1hPAy1oTMAwuhAp08_11dK2DpYicO5mMK90aq0h6dyes/edit?tab=t.0

WEEKLY MEETING TIMES: 
1) After class on Tuesdays (4:45-5:45PM) in Ferland Hall.
2) Saturday afternoons (1:00-2:00PM) at Fogler Library.
Team members are expected to attend all meetings unless discussed otherwise, and notes will be kept for each meeting to keep everyone on track in case someone misses a meeting.

SYNCHRONOUS DEVELOPMENT TIME: This will usually be held on Saturday afternoons after our meeting (2:00-3:00PM) as needed to stay on track with the project. 
If necessary, this could also be held on a weeknight (this would always be discussed in advance). 

COMMUNICATION POLICY: 
We will primarily use our texting group chat for communication, and our team discord channel as needed for sending documents, etc.
Team members are expected to reply to all messages intended for them within 24 hours on business days, 
and are strongly encouraged to reply to any other messages in the group chat where they have useful ideas or suggestions. 
Project manager will send out a meeting agenda at least a day before each scheduled meeting. 

PLANNED ABSENCE POLICY:
In the event that the project manager (Adam) will be absent for multiple days, he let the team know as soon as the circumstances are known and Alex will take over as the Interim Project Manager during the absence. In the event that a developer or designer will be absent for multiple days, they will let the team know as soon as the circumstances are known and ask for assistance on their tasks if necessary.

QUALITY CHECK POLICY:
All tasks should be given a “quality check” due date in the Kanban team. 
Quality check due dates should always be set to, at the latest, the start time of the sprint review meeting.
The sprint review meeting should take place, at a minimum, 48 hours before the actual due date. 
This will give everyone enough time to finish up if there are any unforeseen problems or delays, or if any team member is unable to finish their part of the sprint due to an emergency and their work needs to be reassigned. 
Ideally, team members should start working on the sprint as soon as possible after the work is divided up into individual tasks. This will allow for sufficient time for collaboration with other team members if there are any problems, and help avoid last minute scrambles. 
All written portions of a sprint should be proofread by at least one other team member, because writing can always be improved. 
At the sprint review meeting, multiple team members should make sure each new feature of the project works as intended, and if not, create a plan for completion by the actual deadline. 

PROBLEM STATEMENT #1:
Every year, thousands of UMaine students are faced with financial dilemmas. For example, should I stay on campus or find off campus housing? Should I buy a meal plan or buy groceries and cook for myself? How do I manage my budget and account for payment due dates / biweekly deposits for income? 

It can be very hard for them to find the right tool to manage their finances. Not all students are good at spreadsheet calculations, and even those who are might not have the time to run the numbers and make informed decisions. Even still, there are students who have not been taught the necessary financial literacy skills to manage their finances on their own. There are very in-depth, popular, and useful budgeting tools offered by services like NerdWallet and Rocket Mortgage; they can be extremely helpful for adults trying to manage their finances, especially ones who are in complex financial situations. However, college students have much less experience with personal finance, and often find these tools hard and very time consuming to use. On top of this, many large budgeting aid services have features that simply do not apply to students, such as mortgage, insurance, etc., as well as most of them having options to pay a monthly fee to use the service. This lack of a simple, quick, free, and easy budgeting tool geared towards UMaine college students can lead to students making financial decisions that they regret later on. How can students figure out answers to their financial questions quickly through a simple and effective tool that will enable them to make informed choices with their finances?


PROBLEM STATEMENT #2: 
Managing personal finances as a college student can be overwhelming, with income sources, expenses, and financial obligations to track. Existing budgeting tools like Goodbudget, EveryDollar, and NerdWallet often require bank connections, are overly complex, and include unnecessary features that don't cater to student needs. 

Each student's financial situation is different, and the design of our application hopes to allow for a student in any financial situation to find a use for it. Student may recieve income from their family, government grants, part-time employment, and other sources. Students also have varying expenses. Our application will simply allow for tracking of a student's incoming and outgoing cash to model and monitor their cashflow, so any student that spends money could find it useful.

Our goal is to create a simple, user-friendly financial planning tool tailored specifically for UMaine students. Unlike common budgeting apps, we eliminate unnecessary complexity—no bank connections, no hidden fees—just straightforward financial tracking. Students easily input income sources like cash, biweekly paychecks, and expenses while automatically scheduling key due dates for rent, tuition, and credit card payments. Designed with college-specific needs in mind, we account for meal plan costs, off-campus vs. on-campus expenses, and gas vs. housing trade-offs. 

To make managing your financial data even easier, students can import data from Excel/CSV, upload receipts, and sign in with Google for seamless access. A biweekly paycheck scheduler will help break down tax deductions and encourage savings without the hassle. By focusing on simplicity, transparency, and student financial needs, our solution will provide a stress-free alternative to complicated budgeting apps, empowering students to take control of their finances with ease.

Privacy & Financial Information Statement:
	One suggestion that came up during usability testing was the idea of connecting bank account information with Farhan’s Fabulous Financial Planner. Our original plan was to avoid doing this because it would raise significant privacy concerns. Keeping bank account information secure through our website would be a huge challenge for our developers, and our users may feel that connecting their banking information with our website is risky. So, we decided to research this issue in more detail and came to the conclusion that not connecting with financial institutions is indeed the best approach for Farhan’s Fabulous Financial Planner.

	If Farhan’s Fabulous Financial Planner were to connect with financial institutions, we would need to ensure that all data held in our website is completely encrypted. Even if we do that and are positive that we have a bulletproof system, it is impossible to say with 100% certainty that no data will be compromised. Our goal is to help users with their financial peace of mind, and the last thing we would want is to be the reason their account information was stolen. Breaches have happened to financial institutions that employ countless professional software developers and cybersecurity professionals; consider for instance the 2017 Equifax breach that impacted around 143 million Americans. Holding actual bank account information and potentially credit scores and SSNs feels like too much of a risk for a group of beginner software developers like us to undertake for an academic project.

