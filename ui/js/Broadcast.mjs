export class Broadcast {
    static send(message) {
        const bc = new BroadcastChannel('botanika');
        bc.postMessage(message);
    }

    static listen(callback) {
        const bc = new BroadcastChannel('botanika');
        bc.onmessage = callback;
    }
}