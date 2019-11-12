'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ylFlexStyle.js';
const ver = `yko/${my} v191112`;
//
const baseBgColor = "#BBBBFF",
    titleTxtColor = "#3355AA",
      bodyBgColor = "#DFDFFF",
     bodyTxtColor = "#000000",
   footerTxtColor = "#7777AA",
 DiscordInviteURL = 'https://discord.gg/VBQVU3j',
     titleIconURL = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTdTYIXX7GbVZo46fvO31a958Q4O6TVJpHlEhN6PUibybOAhJv7";
//
module.exports.create = function (U, A) {
  if (! A || ! A.userName || ! A.text)
      U.throw(`[LINE:FlexStyle] Incomplete argument`);
  const flex = $template_(A.style || 'Discord');
  const Body = flex.body.contents,
       Links = [],
      Images = [];
  A.text.replace(/(https?\:\/\/[^\s\n]+)/g, x=> {
    if (/\.(?:jpe?g|gif|png)$/i.test(x))
         { Images.push($imageType_(x)) }
    else { Links.push($linkType_(x)) }
    return x;
  });
  if (Links.length > 0) Body.splice(Body.length, 0, ...Links);
  if (Images.length> 0) Body.splice(Body.length, 0, ...Images);
  return flex;
  //
  function $imageType_ (url) {
    return {
         type: "image",
          url: url,
         size: "full",
  aspectRatio: "2:1",
   aspectMode: "cover",
       action: {
    type: "uri",
     uri: url
      }
    };
  }
  function $linkType_ (url) {
    return {
      type: "button",
     style: "link",
    height: "sm",
    action: {
   type: "uri",
  label: U.tool.cut(url, 35, '...'),
    uri: url
      }
    };
  }
  function $template_ (style) {
    switch (style.toLowerCase()) {
      case 'discord':
        return $DiscordStyle();
        break;
      default:
        U.throw(`[LINE:FlexStyle] There is no '${style}'.`);
    }
  }
  function $DiscordStyle () {
    return {
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "baseline",
    "paddingAll": "2px",
    "paddingStart": "xxl",
    "backgroundColor": baseBgColor,
    "spacing": "md",
    "action": {
      "type": "uri",
      "uri": DiscordInviteURL
    },
    "contents": [
      {
        "type": "icon",
        "size": "sm",
        "url": titleIconURL
      },
      {
        "type": "text",
        "color": titleTxtColor,
        "text": A.userName,
        "weight": "bold",
        "size": "md",
        "flex": 5
      }
    ],
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "10px",
    "backgroundColor": bodyBgColor,
    "contents": [
      {
        "type": "text",
        "text": U.tool.Zcut(A.text, 1000, '...'),
        "color": bodyTxtColor,
        "size": "md",
        "wrap": true
      }
    ],
  },
  "footer": {
    "backgroundColor": baseBgColor,
    "type": "box",
    "layout": "vertical",
    "paddingAll": "0px",
    "paddingEnd": "xxl",
    "contents": [
      {
        "type": "text",
        "text": "by Discord",
        "color": footerTxtColor,
        "size": "xxs",
        "align": "end"
      }
    ]
  }
};
  }
}
