function handleError(error, type = "General") {

  const message =

    getErrorMessage(

      error,

      type

    )

  console.error(

    message

  )

  return {

    success: false,

    type,

    message

  }

}

function getErrorMessage(

  error,

  type

) {

  const errors = {

    Analysis:

      "Website analysis failed",

    Asset:

      "Asset download blocked",

    Export:

      "Export failed",

    AI:

      "AI generation failed",

    General:

      "Unknown error"

  }

  const fallback =

    errors[type]

    || errors.General

  if (error?.message) {

    return `${fallback}: ${error.message}`

  }

  return fallback

}

function safeExecute(

  callback,

  type = "General"

) {

  try {

    return callback()

  }

  catch (error) {

    return handleError(

      error,

      type

    )

  }

}

async function safeExecuteAsync(

  callback,

  type = "General"

) {

  try {

    return await callback()

  }

  catch (error) {

    return handleError(

      error,

      type

    )

  }

}
