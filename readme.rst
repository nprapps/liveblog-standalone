liveblog-standalone
======================================================

The liveblog-standalone project is a toolkit for building auto-updating pages from a structured Google Doc. It is used at NPR for live coverage situations, like our `2020 Iowa caucus field reports <https://apps.npr.org/liveblogs/20200203-iowa/>`_. It's a successor to our original `Liveblog rig <https://github.com/nprapps/liveblog>`_.

This news app is built on our `interactive template <https://github.com/nprapps/interactive-template>`_. Check the readme for that template for more details about the structure and mechanics of the app, as well as how to start your own project.

Getting started
---------------

To run this project you will need:

* Node installed (preferably with NVM or another version manager)
* The Grunt CLI (install globally with ``npm i -g grunt-cli``)
* Git

With those installed, you can then set the project up using your terminal:

#. Pull the code - ``git clone git@github.com:nprapps/liveblog-standalone``
#. Enter the project folder - ``cd liveblog-standalone``
#. Install dependencies from NPM - ``npm install``
#. Get the liveblog document from Google - ``grunt docs``
#. Start the server - ``grunt``

Running tasks
-------------

Like all interactive-template projects, this application uses the Grunt task runner to handle various build steps and deployment processes. To see all tasks available, run ``grunt --help``. ``grunt`` by itself will run the "default" task, which processes data and starts the development server. However, you can also specify a list of steps as arguments to Grunt, and it will run those in sequence. For example, you can just update the JavaScript and CSS assets in the build folder by using ``grunt bundle less``.

Common tasks that you may want to run include:

* ``sheets`` - updates local data from Google Sheets
* ``docs`` - updates local data from Google Docs
* ``google-auth`` - authenticates your account against Google for private files
* ``static`` - rebuilds files but doesn't start the dev server
* ``cron`` - runs builds and deploys on a timer (see ``tasks/cron.js`` for details)
* ``publish`` - uploads files to the staging S3 bucket

  * ``publish:live`` uploads to production
  * ``publish:simulated`` does a dry run of uploaded files and their compressed sizes

* ``local`` - starts a version of the server locally, updating the document every few seconds
* ``deploy`` - starts the update/parse/publish loop, targeting the staging bucket
* ``deploy-live`` - deploy but for the production bucket

How it works
------------

Essentially, the liveblog is built in three pieces. For editors and reporters, a Google Doc add-on helps them write an ArchieML document containing the page configuration and all posts. They can also use the add-on to add embedded content, or to check the document structure for errors. This code is checked into the ``add-on`` folder. 

The second part of the application is a pretty standard cycle of getting the latest document contents, parsing it, and then feeding that into the template for deployment. This step means that people loading the page for the first time immediately get the current contents of the blog, and all text is available for search engines to process.

Finally, once the page is loaded, the client-side code takes over. Any embeds that are expressed through custom elements are upgraded and set to lazy-load their contents. At regular intervals, JavaScript also requests a copy of the page and updates the DOM to match, showing a "new posts" button and updating the title to let readers know when new content has arrived.

This update process follows the following heuristic:

#. The current page is loaded via AJAX, and parsed into an inert document fragment.
#. We query the fragment for all post elements, and match those against the current document via their ID.

   #. If a matching ID exists, we use ``morphdom`` to diff the two and update in place
   #. If there's no matching post on the page, we copy the post in but hide it from view to prevent jumpiness
   #. If there's a post in the page that doesn't have a matching ID (i.e., something was unpublished), we remove it

#. We check the number of hidden posts (from this or previous updates) and show the "new posts" button if any exist.
#. Non-post parts of the document fragment (such as the headline, window title, and audio player target URL) are queried and used to update their counterparts.

The ``morphdom`` diff is configured to ignore the contents of custom elements, which keeps it from disturbing embedded content (such as tweets, Sidechain iframes, or lazy-loaded images).

Creating a new liveblog
-----------------------

First, you'll want to set up a new Google Doc. You can start with a blank document and use `Clasp <https://https://developers.google.com/apps-script/guides/clasp>`_ to push the add-on code up to its script editor, but it's probably easier to simply duplicate our `base document <https://docs.google.com/document/d/1YP-qSizjJc6vBUrUpyH74FQZ5GjZYO5MEoj4XvDMziM/edit>`_, which already has the add-on enabled, or a recent liveblog document. If there's content already in the document, use the Liveblog menu to reset it. You should also use the menu to configure the document with a media URL prefix and an author dictionary spreadsheet.

Locally, create a branch in this repo with your liveblog slug, and update the ``project.json`` file with matching S3 paths and liveblog URLs. Set the "docs" property in that config file to point to the ID of the Google Doc you just created. With that done, you should be able to run ``grunt docs default`` to test the page on your current machine.

Deployment server
-----------------

We are currently deploying this on EC2 using SystemD to run it as a Linux service. This means the server will restart it when it crashes, and provide a standard mechanism for collecting/following log messages.

You can create the systemd unit file by running ``grunt systemd``. This file includes instructions for installing and starting the service at the top. Once the service is installed, you can use the ``systemctl`` command to check on it and control its operation::

    sudo systemctl start liveblog
    sudo systemctl stop liveblog
    sudo systemctl status liveblog

To update the code running on the server, SSH into the EC2 box, enter the ``liveblog`` directory, and ``git pull`` to get the latest source. To be safe, restart the server with ``sudo systemctl restart liveblog``--this will force the server to redeploy all resources (the schedule deployments only run HTML templating, not scripts or styles).

To monitor the liveblog during production, you can run a local copy via ``grunt local``, or you can follow the logs on the server by logging in via SSH and running ``journalctl -u liveblog -af -o cat`` (``a`` is the flag for text-only logs, ``f`` means to follow, and ``-o cat`` hides extraneous log content like detailed timestamps and service nametags.

Troubleshooting
---------------

In general, the liveblog is pretty resistant to damage. The main things that can happen:

* The document must have a {config} section and a [posts] array before the actual post content pages.
* If a text block or headline has their :end tag removed, it'll start eating posts until it hits the next headline: field. We have some minimal checks for this that will halt updates if we detect it. But if you see a post vanish, or it suddenly has no text, make sure the ending tag wasn't deleted.
* Publish dates that don't match ISO-8601 standards will fail to parse. Make sure to set the date through the add-on, or to replace it with "false" to hide a post.
* You can't have duplicate slugs.
* Posts must have a headline, slug, text, author, and published line of some sort

**Fatal error: Port 35729 is already in use by another process.**

The live reload port is shared between this and other applications. If you're running another interactive-template project or Dailygraphics Next, they may collide. If that's the case, use ``--reload-port=XXXXX`` to set a different port for the live reload server. You can also specify a port for the webserver with ``--port=XXXX``, although the app will automatically find the first available port after 8000 for you.