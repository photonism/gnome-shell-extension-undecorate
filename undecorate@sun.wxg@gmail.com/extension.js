import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

function undecorate(window) {
    if (!window.decorated)
        return;

    try {
        GLib.spawn_command_line_async('xprop -id ' + activeWindowId(window)
            + ' -f _MOTIF_WM_HINTS 32c -set'
            + ' _MOTIF_WM_HINTS "0x2, 0x0, 0x0, 0x0, 0x0"');
    } catch(e) {
        console.error(e);
    }
}

function activeWindowId(window) {
    try {
        return parseInt(window.get_description(), 16);
    } catch(e) {
        console.error(e);
        return;
    }
}

export default class UndecorateExtension extends Extension {
    constructor(metadata) {
        super(metadata);

        this._windowCreatedId = 0;
    }

    _onWindowCreated(_display, window) {
        if (window.get_window_type() !== Meta.WindowType.DESKTOP) {
            undecorate(window);
        }
    }

    enable() {
        this._windowCreatedId = global.display.connect(
            'window-created',
            this._onWindowCreated.bind(this)
        );

        let actors = global.get_window_actors();
        for (let actor of actors) {
            let window = actor.get_meta_window();
            if (window && window.get_window_type() !== Meta.WindowType.DESKTOP) {
                undecorate(window);
            }
        }
    }

    disable() {
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = 0;
        }
    }
}
