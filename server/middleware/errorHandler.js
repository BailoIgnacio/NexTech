// Middleware global de manejo de errores para Express.
// Captura cualquier error lanzado con next(err) en los controladores.
// Responde siempre con JSON: { error: "mensaje" } y el status HTTP correspondiente.
function errorHandler(err, req, res, next) {
  const status = err.status || 500; // Si el error no tiene status, se asume un error interno del servidor
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
}

module.exports = errorHandler;
