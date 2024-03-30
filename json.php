<?php

// URL de tu sitio de WordPress y ruta a la API REST
$wp_url = 'https://tovarmanuel.com/wp-json/wp/v2/posts';

// Datos de la entrada de blog en formato JSON
$json_data = '{
    "title": "Título de la entrada",
    "content": "Contenido de la entrada",
    "status": "publish", // Si deseas publicar la entrada inmediatamente
    "categories": [1], // ID de la categoría a la que quieres asignar la entrada
    "tags": ["etiqueta1", "etiqueta2"], // Etiquetas de la entrada
    "date": "2024-03-21T00:00:00" // Fecha de publicación
}';

// Autenticación
$username = 'adminManuelTovar';
$password = 'Manuel4330949Tovar*';

// Configuración de la solicitud
$args = array(
    'headers' => array(
        'Authorization' => 'Basic ' . base64_encode( $username . ':' . $password ),
        'Content-Type'  => 'application/json',
    ),
    'body'    => $json_data,
    'method'  => 'POST',
);

// Realizar la solicitud a la API REST de WordPress
$response = wp_remote_post( $wp_url, $args );

// Verificar si la solicitud fue exitosa
if ( is_wp_error( $response ) ) {
    $error_message = $response->get_error_message();
    echo "Error: $error_message";
} else {
    $response_code = wp_remote_retrieve_response_code( $response );
    if ( $response_code == 201 ) {
        echo "Entrada creada exitosamente.";
    } else {
        echo "Error al crear la entrada. Código de respuesta: $response_code";
    }
}
