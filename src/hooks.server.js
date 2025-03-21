export const handle = async ({ event, resolve }) => {
  // 设置 CORS 头
  event.setHeaders({
    'Access-Control-Allow-Origin': '*', // 允许所有来源
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // 允许的 HTTP 方法
    'Access-Control-Allow-Headers': 'Content-Type, Origin', // 允许的请求头
  });

  // 继续处理请求
  return resolve(event);
};
