# starrySky
Render a dynamic starry sky by canvas.

***
# usage

```js
  <script src="./js/starrySky.js"></script>
  <script>
    new StarrySky({
      lineColor: 'yellow',
      starFillColor: 'yellow'
    }).start()

    // stop() is called to stop render.
  </script>
```

# options

option|description|default
--|:--|:--
starCount|The count of star,could be 0.1/0.2... 1|0.5
containerSelector|container, supports css selector|.starry-sky-container
enableConnectLine|show connection lines beteween each star|true
enableMouseEvent|connect lines when we are moving mouse over the container|true
enableClickEvent|connect lines when we are click on somewhere in container|true
mouseRange|the range to decide how far of the star will be connected|58
lineColor|color of connecting line|#dcdcdc
mouseLineColor|color of connecting line of mouse event|skyblue
containerBackgroundColor|background color of container|rgba(0, 0, 0, .95)
starFillColor|color of star|random gray color
