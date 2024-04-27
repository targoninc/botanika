export class GenericEndpoint {
    static method = 'GET';
    static path = '/';
    static handler = (req, res, context, db, ws) => res.send('Hello, World!');
}