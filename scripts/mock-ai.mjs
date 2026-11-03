import { createServer } from "node:http";

let calls = 0;
const server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    const payload = JSON.parse(body);
    if (/Cliente de teste|teste@example\.invalid|Registro fictício/i.test(body)) {
      res.writeHead(400).end();
      return;
    }
    if (!payload.messages?.some((message) => /facial|agregados da semana/i.test(message.content))) {
      res.writeHead(400).end();
      return;
    }
    calls += 1;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ choices: [{ message: { content: `Resposta fictícia segura ${calls}` } }] }));
  });
});
server.listen(43210, "127.0.0.1", () => console.log("Mock AI provider ready on 127.0.0.1:43210"));
