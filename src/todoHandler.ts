export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      todos: [
        'Todo 1',
        'Todo 2',
        'Todo 3'
      ]
    })
  }
}