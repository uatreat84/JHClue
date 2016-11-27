
How to set up the environment for ClueLess development (note that I'm using a MAC, so instructions will vary on Windows)

1) Download Node.js from https://nodejs.org/en/ (I chose v6.9.1 which was recommended for most users)

2) I forget how the installation of node.js goes, but I think it was just a wizard and it askes that it's in your path.  Mine was installed in /usr/local/bin 

3) If node is setup correctly you should be able to open a console and type:
	node  // this brings up node and you can type in commands after the '>' prompt
	> console.log('HelloWorld');
	HelloWorld  // the output from the above command
	.exit // exits

4) When you installed node, you would have also installed npm (node package manager).  Try a 'node -v' and 'npm -v' to get the versions.  Mine are:
	$ node -v
	v6.9.1
	$ npm -v
	3.10.8

5) Now run 'npm install -g express-generator' to install express (note that I needed to use sudo since it complained about permissions: 'sudo npm install -g express-generator')... not sure how DOS does it.)

6) Install nodemon (this is a cool thing that monitors for changes and automatically restarts the server to get your changes... saves you from having to do it)
	'npm install -g nodemon'
	or if you get permission errors like me:
	'sudo npm install -g nodemon'

7) if you were starting your own project, you would use express to setup a web app, feel free to try it in a sandbox area: 'express myTestApp' ... I won't go any further, but you can checkout a youtube walkthrough here: https://www.youtube.com/watch?v=FqMIyTH9wSg

8) Make sure you fetched the latest from our git.

9) Start the server and run clueless:  'nodemon <path to JHClue/index.js>'
	$ nodemon ./JHClue/index.js
	(ctrl-c to quit)

10) Go to your web browser and type in http://localhost:3000/
	// At this point it seems Matt has gotten it to work up to starting the game (users select players and choose to start the game)

	