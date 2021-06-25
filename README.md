# JSON Editor

A small json editor.

![image](https://user-images.githubusercontent.com/77860571/123482922-f7f86900-d5d3-11eb-8031-8d55dc3e0897.png)

## This is a working JSON editor online

This create-react-app can be used to generate and modify JSON files easily and intuitively. The current live version can be found on: https://jsoneditor.arcanewright.com/

This app was built over one week, thought I had been thinking about the idea for a little longer. 

## How it works

Basically, it takes in a JSON document, converts that into standalone components with parent relationships, displays and allows the editing of these components, and then converts everything back into a JSON document which can be downloaded. 

It makes use of HTML features such as draggables, FileReaders, and Blobs.

It uses the react-uuid library for uuid creation (when making the standalone components).

Any feedback or review would be appreciated.
