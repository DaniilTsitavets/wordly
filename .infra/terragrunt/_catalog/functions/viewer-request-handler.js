function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // SPA routing
    if (uri.startsWith("/") && !uri.includes(".")) {
        request.uri = "/index.html";
    }

    return request;
}
