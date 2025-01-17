// Copyright (C) 2024 Tristan de Cacqueray
// SPDX-License-Identifier: GPL-3.0
//
// This module contains the web component.

// Prepare the template from external file using vite raw import
const playerTemplate = document.createElement("template");
import playerTemplateBody from "./player.html?raw";
playerTemplate.innerHTML = playerTemplateBody;

import Peaks from "peaks.js";

function setAutoWidth(setWidth) {
  // adjust width if necessary
  const screenWidth = window.innerWidth;
  if (screenWidth < 600) {
    // tiny screen should use all the available space
    setWidth((window.innerWidth - 20) + "px");
  } else if (screenWidth < 1000) {
    // small screen uses 600px
    setWidth("600px");
  } // otherwise the default is 1000px
}

class PeaksPlayer extends HTMLElement {
  static observedAttributes = [
    "width",
    "url",
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(playerTemplate.content.cloneNode(true));
    this.audioElt = this.shadowRoot.getElementById("m-audio");
    this.zoomElt = this.shadowRoot.getElementById("m-zoomview");
    this.overviewElt = this.shadowRoot.getElementById("m-overview");
  }

  connectedCallback() {
    setAutoWidth(this.setWidth.bind(this));

    if (this.firstMedia) {
      // The media was provided before the canvas was loaded, init the peaks now.
      this.initPeaks(this.firstMedia);
    }
    this.connected = true;
  }

  initPeaks(firstMedia) {
    const options = {
      zoomview: {
        container: this.zoomElt,
        playheadColor: "pink",
      },
      overview: {
        container: this.overviewElt,
        waveformColor: "#ddd",
        playheadColor: "pink",
      },
      mediaElement: this.audioElt,
      dataUri: {
        arraybuffer: firstMedia + ".dat",
      },
    };

    let instance = this;
    Peaks.init(options, function (err, peaks) {
      if (err) {
        console.error("Failed to initialize Peaks instance", err);
      } else {
        instance.peaks = peaks;
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "url") this.setUrl(newValue);
    else if (name === "width") this.setWidth(newValue);
  }

  setWidth(width) {
    this.audioElt.style.width = width;
    this.zoomElt.style.width = width;
    this.overviewElt.style.width = width;
    // TODO: refresh the Peaks if necessary
  }

  setUrl(baseValue) {
    if (!this.peaks) {
      // The first media needs to be set manually.
      // Later we'll use setSource
      const srcElt = document.createElement("source");
      srcElt.src = baseValue + ".mp3";
      srcElt.type = "audio/mpeg";
      this.audioElt.appendChild(srcElt);
      if (this.connected) {
        // The media was provided after the canvas was loaded, we can init the peaks now.
        this.initPeaks(baseValue);
      } else {
        // Otherwise we'll wait for the canvbas to be loaded.
        this.firstMedia = baseValue;
      }
    } else {
      this.peaks.setSource({
        mediaUrl: baseValue + ".mp3",
        dataUri: {
          arraybuffer: baseValue + ".dat",
        },
      }, (err) => {
        if (err) {
          console.error("Failed to update Peaks instance", err);
        }
        this.peaks.player.play();
      });
    }
  }
}

customElements.define("peaks-player", PeaksPlayer);

// Prepare the template from external file using vite raw import
const playlistTemplate = document.createElement("template");
import playlistTemplateBody from "./playlist.html?raw";
playlistTemplate.innerHTML = playlistTemplateBody;

class PeaksPlaylist extends HTMLElement {
  static observedAttributes = [
    "width",
    "pos",
    "url",
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(playlistTemplate.content.cloneNode(true));
    this.pos = 0;

    // Bind the dom
    this.playerElt = this.shadowRoot.getElementById("m-player");
    this.infoElt = this.shadowRoot.getElementById("m-info");
    this.dlElt = this.shadowRoot.getElementById("m-dl");
    this.titleElt = this.shadowRoot.getElementById("m-title");
    this.dateElt = this.shadowRoot.getElementById("m-date");
    this.posElt = this.shadowRoot.getElementById("m-pos");
    this.playlistElt = this.shadowRoot.getElementById("m-playlist");

    // Setup controllers
    this.shadowRoot.getElementById("m-prev").onclick = () => {
      if (this.pos > 0) this.setPos(this.pos - 1);
    };
    this.shadowRoot.getElementById("m-next").onclick = () => {
      if (this.items && this.pos + 1 < this.items.length) {
        this.setPos(this.pos + 1);
      }
    };

    // wait for peaks player to be initialized.
    // TODO: listen to <audio> event directly
    const attachPlayerEvent = () => {
      if (this.playerElt.peaks) {
        this.playerElt.peaks.on("player.ended", () => {
          this.setPos((this.pos + 1) % this.items.length);
        });
      } else {
        setTimeout(attachPlayerEvent, 1000);
      }
    };
    setTimeout(attachPlayerEvent, 1000);
  }

  connectedCallback() {
    setAutoWidth(this.setWidth.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "url") this.setUrl(newValue);
    else if (name === "width") this.setWidth(newValue);
    else if (name === "pos") this.setPos(parseInt(newValue - 1));
  }

  setPos(pos) {
    this.pos = pos;
    if (this.items) {
      this.loadItem(pos);
    }
  }

  setWidth(width) {
    this.infoElt.style.width = width;
    this.playlistElt.style.width = width;
    this.playerElt.setWidth(width);
  }

  setUrl(url) {
    // remove json filename from the url
    const basename = url.substr(0, url.lastIndexOf("/"))
    this.baseUrl = URL.parse(basename, window.location.origin);
    fetch(new Request(url))
      .then((
        response,
      ) => response.json())
      .then(this.setItems.bind(this));
  }

  loadItem(pos) {
    const af = this.items[pos];
    const url = af.path[0] == '/' ?
          this.baseUrl.origin + af.path : this.baseUrl.href + "/" + af.path;
    this.titleElt.textContent = af.title;
    this.dateElt.textContent = af.date;
    if (af.format && af.format.indexOf('flac') > 0) {
      this.dlElt.href = url + ".flac";
    } else {
      this.dlElt.href = url + ".mp3";
    }
    this.posElt.textContent = (pos + 1) + "/" + this.items.length;

    for (let i = 0; i < this.playlistElt.children.length; i++) {
      const trackElt = this.playlistElt.children[i];
      if (i == pos) {
        trackElt.classList.add("m-playing");
      } else {
        trackElt.classList.remove("m-playing");
      }
    }

    // comment the next line when using hot reload to avoid loading the audio data
    this.playerElt.setUrl(url);
  }

  setItems(items) {
    this.items = items;
    // Remove current dom items
    this.playlistElt.innerHtml = "";
    items.forEach((item, idx) => {
      // Create a new playlist entry
      const trackElt = document.createElement("li");
      trackElt.classList.add("m-track");
      if (idx == this.pos) trackElt.classList.add("m-playing");

      // The track number
      const posElt = document.createElement("button");
      posElt.textContent = idx + 1;
      trackElt.appendChild(posElt);
      posElt.onclick = () => {
        this.setPos(idx);
      };

      // The track title
      const titleElt = document.createElement("div");
      titleElt.style["flex-grow"] = 1;
      titleElt.textContent = item.title;
      trackElt.appendChild(titleElt);

      // The track length
      const durElt = document.createElement("div");
      durElt.style["font-family"] = "monospace";
      durElt.textContent = formatTime(item.length || item.len);
      trackElt.appendChild(durElt);

      this.playlistElt.appendChild(trackElt);
    });
    this.loadItem(this.pos);
  }
}

function formatTime(ms) {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}`;
  else if (sec < 3600) return `${Math.floor(sec / 60)}:${sec % 60}`;
  else {return `${Math.floor(sec / 3600)}:${Math.floor((sec % 3600) / 60)}:${
      sec % 60
    }`;}
}

customElements.define("peaks-playlist", PeaksPlaylist);
