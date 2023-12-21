export class GenericEndpoint {
    static method = 'GET';
    static path = '/';
    static handler = (req, res) => res.send('Hello, World!');
}