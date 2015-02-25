# SP-Report
Tool for maintaining a collection of situational reports (SITREP) by date

##Features
- Edit a report (aka SharePoint list item) in an intuitive manner.
- Responsive layout so you can edit on any device (thank you [Foundation](http://foundation.zurb.com))
- Filterable list of reports
- Date Weekly Filters
- Bookmarkable report edit pages (i.e., bookmark a report and when the application opens to that bookmark, you will be routed to that report)
- Breadcrumbs

##Setup
- Download this github repository
- Upload repository to a Document Library in your SharePoint site
- Create a SharePoint list with the following columns
  - Department
    - Type: Choice
    - Choices: Whatever your deparment names are
  - Description
    - Type: Multiline
  - Date
    - Type: Date
- Edit config.js
  - SP-Report/js/config.js
  - Add the URL of your SharePoint list to the app.config.url attribute.
  - Add the GUID of your SharePoint list to the app.config.guid attribute.
  - Add the departments you created in the SharePoint list to app.config.departments as keys with their property equal to the value you want to be rendered in the report.
    ```javascript
    /* js/config.js */
    var app = app || {};
    
    app.config = {
      departments: {
        'N/A': '',
        'Some Department': 'SD' //use of an accronym for the display value
      },
      url: '',
      guid: ''
    };


    app.property_map = {
        ows_department: 'department',
        ows_description: 'description',
        ows_id: 'id',
        ows_modified: 'modified',
        ows_created: 'created',
        ows_date: 'date'
    };
    ```

##Compatibility
- IE9+, Chrome, Firefox
- SharePoint 2007*-2013

*This application will work in SharePoint 2007 environments when opened in your browser only.  You cannot properly use this module in a content editor webpart or page viewer webpart due to the inheritance of quirks mode from the aforementioned SharePoint 2007 to any embeded iframes. :(