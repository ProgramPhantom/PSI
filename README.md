> [!IMPORTANT]
> This project is a WORK IN PROGESS ⌛
 

<div align="center">
  🔥 <a href="https://programphantom.github.io/PSI/">Link to page</a> 🔥
</div>

---

<p align="center">
  <img src="Banner.png" />
</p>

<div align="center">
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E) ![Github Pages](https://img.shields.io/badge/github%20pages-121013?style=for-the-badge&logo=github&logoColor=white) [![pages-build-deployment](https://github.com/ProgramPhantom/PSI/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/ProgramPhantom/PSI/actions/workflows/pages/pages-build-deployment) ![NPM Version](https://img.shields.io/npm/v/npm)
  
</div>


Pulse Planner is a web application for creating Nuclear Magnetic Resonance (NMR) pulse sequence diagrams. These diagrams describe sequences of electromagnetic pulses that are fired at samples to determine their molecular makeup. By recording the feedback from these pulses coming off the sample, precise information can be acquired regarding the composition of the sample. The specifics of the type of pulses and the order in which they are fired can change the accuracy of the results, making construction of NMR pulse sequences an important and highly useful area of Chemistry.

You can check out some example pulse sequnce diagrams on the Manchester NMR Methodology Group's website [here](https://www.nmr.chemistry.manchester.ac.uk/?q=node/327).

## 🔨 Features

Pulse planner was created to revolutionise the way scientists can plan NMR pulses sequences. It allows the rapid prototyping, annotating and sharing beautifully formatted pulse sequence images. Pulse planner makes it as easy as a drag and a drop to start creating professional, scientific standard diagrams, and comes with unlimited customisation capabilities. Here are a few of the features this application provides:

- Enables the rapid prototyping of NMR pulses sequences
- Provides a declarative interaction system, meaning users need not worry about formatting and positioning of graphical elements
- Gives way to formalise syntax for pulse sequence diagrams
- Has the ability to share and collaborate on pulse sequence diagrams
- Inlcudes a flexible components based system, which allows concepts for new pulses to be uploaded and shared

## ✍ How to use

<img width="1874" height="931" alt="image" src="https://github.com/user-attachments/assets/e0e62813-ca9f-401a-98bd-c2a296693803" />

Pulse Planner was made with the user experience in mind. To use the application fulently, liken yourself to some of the terminology for different aspects of the UI.

- Canvas: this is the pannable and zoomable area in the top left of the screen. This is where you interact with your pulse sequence diagram. This is the target for drag and drop operations, and allows you to select and move elements.
- Elements draw: this is the area below the canvas. It contains all your pulse "prefabs", pre-configured pulses that you can easily add to the canvas with a simple drag and drop. It also contains functionality to add "Schemes" - transportable collections of pulses and other elements that can be created, inported and exported in this area.
- Form: the area on the right of the screen is for creating and modifying elements.
- Banner: the banner at the top of the screen contains useful tools for saving and loading diagrams.

### To get started using Pulse Planner

1. Create a new channel by interacting with the neurtral state form on the right. Give it a suitable latex input for the channel label, then click add at the bottom of the form.
2. Drag and drop elements from the elements draw to the diagram. When dragging, drop areas appear in the mounting locations on the diagram. Hover the mouse over one of these options and let go to fix the pulse in place. You can either "place" a pulse in a unoccupied slot in a column, or insert in-between a column using the small thin areas.
3. To interact with placed pulses, double click on that pulse. You can modify a pulse by changing the fields that appear in the form. Click modify to confirm the changes. You can also delete pulses here by pressing the red bin button.
4. When no pulse is selected, you can add a new channel on the right.
5. When you are happy with your sequence, choose one of the two export buttons to save your pulse.
6. To save your pulse locally, click the "Save State" button.
7. If you wish to export your pulse to give to someone else and for safe-keeping, choose "copy state" and save the content of the clipboard to a json file.

## ⚙ How it works

Pulse Planner is a client side single page web application built using the <kbd>[react](https://react.dev/)</kbd> framework and <kbd>[typescript](https://www.typescriptlang.org/)</kbd>. It currenlty does not have a backend, but this is something that may be added in the future depending on how far I take the application. At the heart of Pulse Planner is a small, lightweight custom layout manager, which defines and controls the layout of the pulse sequence diagrams. It uses a "binding" system to automatically update dependent objects when an object moves.

### 👩‍💻 For developers

We use <kbd>vite</kbd> to host a developer server. First, make sure your computer has node.js installed, follow the instructions here: [https://nodejs.org/en/download](https://nodejs.org/en/download).
First, clone the repository to somewhere on your computer: 
```
git clone https://github.com/ProgramPhantom/PSI.git
```
navigate to the repository and install vite with:
Once you've done that, install vite with
```
npm install -D vite
```

Now you have access to host the program locally with the Vite webserver. Run it by running `npm run dev` in the terminal.
