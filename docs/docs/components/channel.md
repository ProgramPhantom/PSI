# Channel

The `Channel` element represents a single track (or signal line) in a sequence. It is made of a $3 \times (N+1)$ sized grid where $N$ is the number of columns used for pulses. There is one additional column that the `ChannelLabel` sits in. 

## Components

- **`channelLabel`**: A LaTex visual component (rendered using LaTeX markup) placed at the start of the channel. In order to modify this component, select the channel, then double click on the element. You will then have selected the element and can modify it using the `Form` on the right of the screen. Additionally, as with all text objects, you can double click a selected LaTeX object to modify the LaTeX code directly. 
- **`bar`**: A `RectElement` component placed in the centre of the Channel. It spans from column 1 to the end of the channel. Code automatically lengthens the `bar` to fit the width of the `channel`. In order to select and modify the channel, click on the channel and then double click on the bar. You will now be able to modify the bar using the Form on the right. 

### Reordering Channels

To reorder channels, select the channel you wish to reorder and use the `Channel Reorder Buttons` that appear on the centre right of the `Canvas`.

### Changing Channel Spacing

In order to change the gap between channels, one must modify the top and bottom padding attributes. This padding quantity can be seen as the grey outlined region while selecting a channel. In order to modify this quantity, either select a channel and change the `Padding.Top` and `Padding.Bottom` values in the `Form`, or hover the mouse over the area immediately to the right of the sequence, where the `Channel Padding Overlay` will appear. Then, proceed to select the desired padding quantity and modify it. 