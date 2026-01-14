---
title: Default module
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Default module

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# Admin/Products

## POST update

POST /api/admin/products/update/{productId}

all of them nullableUpdates an existing product.
Validation Rules:
name: sometimes, required, string, max:255
model_number: sometimes, nullable, string, max:255
description: sometimes, nullable, string
base_price: sometimes, required, numeric, min:0
sub_category_id: sometimes, required, integer, exists:sub_categories,id
unit_of_measure_id: sometimes, required, integer, exists:units_of_measure,id
attributes: sometimes, nullable, array
images: sometimes, nullable, array
images.*: image, mimes:jpeg,png,jpg,gif,svg, max:2048
price_tiers: sometimes, nullable, array
price_tiers.*.min_quantity: required, integer, min:1
price_tiers.*.price_per_unit: required, numeric, min:1

> Body Parameters

```yaml
sub_category_id: 2
unit_of_measure_id: "1"
name: كنزة صييفية
description: كنزة صييفية رائع
model_number: "12135465"
base_price: "50"
"images[]":
  - file://C:\Users\Mostafa\Desktop\New folder\تفوق-1-2.jpg
  - file://C:\Users\Mostafa\Desktop\New folder\تقدير-ا-2.jpg
  - file://C:\Users\Mostafa\Desktop\New folder\تميز-1-2.jpg
"attributes[color]": blue
"attributes[size][0]":
  - small
"attributes[size][1]": large
"price_tiers[0][min_quantity]": "5"
"price_tiers[0][price_per_unit]": "250"
"price_tiers[1][min_quantity]":
  - "10"
"price_tiers[1][price_per_unit]": "200"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|productId|path|string| yes |none|
|Accept|header|string| no |none|
|body|body|object| no |none|
|» sub_category_id|body|integer| no |none|
|» unit_of_measure_id|body|string| no |none|
|» name|body|string| no |none|
|» description|body|string| no |none|
|» model_number|body|string| no |none|
|» base_price|body|string| no |none|
|» images[]|body|string(binary)| no |none|
|» attributes[color]|body|string| no |none|
|» attributes[size][0]|body|array| no |none|
|» attributes[size][1]|body|string| no |none|
|» price_tiers[0][min_quantity]|body|string| no |none|
|» price_tiers[0][price_per_unit]|body|string| no |none|
|» price_tiers[1][min_quantity]|body|array| no |none|
|» price_tiers[1][price_per_unit]|body|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

## GET getBySubCategory

GET /api/admin/products/getBySubCategory/{subCategorieId}

> Body Parameters

```yaml
{}

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|subCategorieId|path|string| yes |none|
|per_page|query|string| no |none|
|page|query|string| no |none|
|Accept|header|string| no |none|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

## GET show

GET /api/admin/products/show/{productId}

> Body Parameters

```yaml
{}

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|productId|path|string| yes |none|
|Accept|header|string| no |none|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

## GET index

GET /api/admin/products/index

> Body Parameters

```yaml
{}

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|per_page|query|string| yes |none|
|page|query|string| no |none|
|Accept|header|string| no |none|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

## DELETE delete

DELETE /api/admin/products/delete/{productId}

> Body Parameters

```yaml
{}

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|productId|path|string| yes |none|
|Accept|header|string| no |none|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

## POST store

POST /api/admin/products/store

Creates a new product.
Validation Rules:
name: required, string, max:255
model_number: required, string, max:255
description: required, string
base_price: required, numeric, min:0
sub_category_id: required, integer, exists:sub_categories,id
unit_of_measure_id: required, integer, exists:units_of_measure,id
attributes: nullable, array
images: required, array
images.*: image, mimes:jpeg,png,jpg,gif,svg, max:2048
price_tiers: nullable, array
price_tiers.*.min_quantity: required, integer, min:1
price_tiers.*.price_per_unit: required, numeric, min:1

> Body Parameters

```yaml
sub_category_id: 1
unit_of_measure_id: " 1"
name: " شورت صيفي"
description: " شورت صيفي رائع"
model_number: " 12135465"
base_price: " 250"
"images[]": file:///media/ghaith-shabakji/Files and Programs/Pictures/photoBG.jpg
"attributes[sizes][0][name]": small
"attributes[sizes][1][name]": large
"attributes[sizes][0][colors][]":
  - red
  - blue
"attributes[sizes][1][colors][]":
  - black
  - green
"price_tiers[0][min_quantity]": " 5"
"price_tiers[0][price_per_unit]": " 25"
"price_tiers[1][min_quantity]": " 10"
"price_tiers[1][price_per_unit]": " 20"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Accept|header|string| no |none|
|body|body|object| no |none|
|» sub_category_id|body|integer| no |required|
|» unit_of_measure_id|body|string| no |required|
|» name|body|string| no |required|
|» description|body|string| no |required|
|» model_number|body|string| no |required|
|» base_price|body|string| no |required|
|» images[]|body|string(binary)| no |required|
|» attributes[sizes][0][name]|body|string| no |none|
|» attributes[sizes][1][name]|body|string| no |none|
|» attributes[sizes][0][colors][]|body|string| no |none|
|» attributes[sizes][1][colors][]|body|[string]| no |none|
|» price_tiers[0][min_quantity]|body|string| no |nullable|
|» price_tiers[0][price_per_unit]|body|string| no |nullable|
|» price_tiers[1][min_quantity]|body|array| no |nullable|
|» price_tiers[1][price_per_unit]|body|string| no |nullable|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

# Admin/Side Stores

## POST store

POST /api/admin/stores/store

> Body Parameters

```yaml
name: new store
description: our new store
logo: ""
store_category_id: "1"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Accept|header|string| no |none|
|body|body|object| yes |none|
|» name|body|string| yes |none|
|» description|body|string| no |none|
|» logo|body|string(binary)| no |none|
|» store_category_id|body|string| yes |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST update

POST /api/admin/stores/update/{store_id}

> Body Parameters

```yaml
name: new store (edited)
description: our new store (edited)
logo: ""
store_category_id: "1"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|store_id|path|string| yes |none|
|body|body|object| yes |none|
|» name|body|string| no |none|
|» description|body|string| no |none|
|» logo|body|string(binary)| no |none|
|» store_category_id|body|string| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## DELETE delete

DELETE /api/admin/stores/delete/{store_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|store_id|path|string| yes |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## GET index

GET /api/admin/stores/index

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    null
  ],
  "meta": {
    "total": 0,
    "per_page": 0,
    "current_page": 0,
    "last_page": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|[any]|true|none||none|
|» meta|object|true|none||none|
|»» total|integer|true|none||none|
|»» per_page|integer|true|none||none|
|»» current_page|integer|true|none||none|
|»» last_page|integer|true|none||none|

## GET show

GET /api/admin/stores/show/{store_id}}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|store_id|path|string| yes |none|

> Response Examples

> 404 Response

```json
{
  "status": true,
  "message": "string",
  "data": null
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### Responses Data Schema

HTTP Status Code **404**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|boolean|true|none||none|
|» message|string|true|none||none|
|» data|null|true|none||none|

## GET getStoresByCategory

GET /api/admin/stores/getByCategory/{category_id}}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|category_id|path|string| yes |none|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    null
  ],
  "meta": {
    "total": 0,
    "per_page": 0,
    "current_page": 0,
    "last_page": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|[any]|true|none||none|
|» meta|object|true|none||none|
|»» total|integer|true|none||none|
|»» per_page|integer|true|none||none|
|»» current_page|integer|true|none||none|
|»» last_page|integer|true|none||none|

# Admin/Side Stores Sections

## POST store

POST /api/admin/store-sections/store

> Body Parameters

```yaml
name: new store section
image: ""
store_id: "1"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Accept|header|string| no |none|
|body|body|object| yes |none|
|» name|body|string| yes |none|
|» image|body|string(binary)| no |none|
|» store_id|body|string| yes |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST update

POST /api/admin/store-sections/update/{section_id}

> Body Parameters

```yaml
name: new store section (edited)
image: ""
store_id: "1"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|section_id|path|string| yes |none|
|Accept|header|string| no |none|
|body|body|object| yes |none|
|» name|body|string| no |none|
|» image|body|string(binary)| no |none|
|» store_id|body|string| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## DELETE delete

DELETE /api/admin/store-sections/delete/{section_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|section_id|path|string| yes |none|

> Response Examples

> 404 Response

```json
{
  "status": true,
  "message": "string",
  "data": null
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### Responses Data Schema

HTTP Status Code **404**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|boolean|true|none||none|
|» message|string|true|none||none|
|» data|null|true|none||none|

## GET index

GET /api/admin/store-sections/index

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    null
  ],
  "meta": {
    "total": 0,
    "per_page": 0,
    "current_page": 0,
    "last_page": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|[any]|true|none||none|
|» meta|object|true|none||none|
|»» total|integer|true|none||none|
|»» per_page|integer|true|none||none|
|»» current_page|integer|true|none||none|
|»» last_page|integer|true|none||none|

## GET show

GET /api/admin/store-sections/show/{section_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|section_id|path|string| yes |none|

> Response Examples

> 404 Response

```json
{
  "status": true,
  "message": "string",
  "data": null
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### Responses Data Schema

HTTP Status Code **404**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|boolean|true|none||none|
|» message|string|true|none||none|
|» data|null|true|none||none|

## GET getSectionByStore

GET /api/admin/store-sections/getByStore/{store_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|store_id|path|string| yes |none|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    null
  ],
  "meta": {
    "total": 0,
    "per_page": 0,
    "current_page": 0,
    "last_page": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|[any]|true|none||none|
|» meta|object|true|none||none|
|»» total|integer|true|none||none|
|»» per_page|integer|true|none||none|
|»» current_page|integer|true|none||none|
|»» last_page|integer|true|none||none|

# Admin/Side Stores Categories

## POST store

POST /api/admin/store-categories/store

> Body Parameters

```yaml
name: new store category
image: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Accept|header|string| no |none|
|body|body|object| yes |none|
|» name|body|string| yes |none|
|» image|body|string(binary)| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST update

POST /api/admin/store-categories/update/{category_id}

> Body Parameters

```yaml
name: new store category (edited)
image: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|category_id|path|string| yes |none|
|Accept|header|string| no |none|
|body|body|object| yes |none|
|» name|body|string| no |none|
|» image|body|string(binary)| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## DELETE delete

DELETE /api/admin/store-categories/delete/{category_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|category_id|path|string| yes |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## GET show

GET /api/admin/store-categories/show/{cat_id}}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|cat_id|path|string| yes |none|

> Response Examples

> 404 Response

```json
{
  "status": true,
  "message": "string",
  "data": null
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### Responses Data Schema

HTTP Status Code **404**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|boolean|true|none||none|
|» message|string|true|none||none|
|» data|null|true|none||none|

## GET index

GET /api/admin/store-categories/index

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    null
  ],
  "meta": {
    "total": 0,
    "per_page": 0,
    "current_page": 0,
    "last_page": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|[any]|true|none||none|
|» meta|object|true|none||none|
|»» total|integer|true|none||none|
|»» per_page|integer|true|none||none|
|»» current_page|integer|true|none||none|
|»» last_page|integer|true|none||none|

# Admin/Side Stores Products

## POST update

POST /api/admin/store-products/update/{product_id}

> Body Parameters

```yaml
name: product (edited)
description: nice product (edited)
price: "100"
"images[]": ""
store_section_id: "1"
unit_of_measure_id: "1"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|product_id|path|string| yes |none|
|Accept|header|string| no |none|
|body|body|object| yes |none|
|» name|body|string| no |none|
|» description|body|string| no |none|
|» price|body|string| no |none|
|» images[]|body|string(binary)| no |none|
|» store_section_id|body|string| no |none|
|» unit_of_measure_id|body|string| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## DELETE delete

DELETE /api/admin/store-products/delete/{product_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|product_id|path|string| yes |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST store

POST /api/admin/store-products/store

Creates a new product.
Validation Rules:
name: required, string, max:255
model_number: required, string, max:255
description: required, string
base_price: required, numeric, min:0
sub_category_id: required, integer, exists:sub_categories,id
unit_of_measure_id: required, integer, exists:units_of_measure,id
attributes: nullable, array
images: required, array
images.*: image, mimes:jpeg,png,jpg,gif,svg, max:2048
price_tiers: nullable, array
price_tiers.*.min_quantity: required, integer, min:1
price_tiers.*.price_per_unit: required, numeric, min:1

> Body Parameters

```yaml
store_section_id: 1
unit_of_measure_id: " 1"
name: " شورت صيفي"
description: " شورت صيفي رائع"
model_number: " 12135465"
base_price: " 250"
"images[]": file://C:\Users\abdul\OneDrive\Pictures\24027d8e262291afd1d90d5189d2cc0f.jpg
"attributes[sizes][0][name]": small
"attributes[sizes][1][name]": large
"attributes[sizes][0][colors][]":
  - red
  - blue
"attributes[sizes][1][colors][]":
  - black
  - green
"price_tiers[0][min_quantity]": " 5"
"price_tiers[0][price_per_unit]": " 25"
"price_tiers[1][min_quantity]": " 10"
"price_tiers[1][price_per_unit]": " 20"

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Accept|header|string| no |none|
|body|body|object| no |none|
|» store_section_id|body|integer| no |required|
|» unit_of_measure_id|body|string| no |required|
|» name|body|string| no |required|
|» description|body|string| no |required|
|» model_number|body|string| no |required|
|» base_price|body|string| no |required|
|» images[]|body|string(binary)| no |required|
|» attributes[sizes][0][name]|body|string| no |none|
|» attributes[sizes][1][name]|body|string| no |none|
|» attributes[sizes][0][colors][]|body|string| no |none|
|» attributes[sizes][1][colors][]|body|[string]| no |none|
|» price_tiers[0][min_quantity]|body|string| no |nullable|
|» price_tiers[0][price_per_unit]|body|string| no |nullable|
|» price_tiers[1][min_quantity]|body|array| no |nullable|
|» price_tiers[1][price_per_unit]|body|string| no |nullable|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "access_token": "string",
    "token_type": "string",
    "expires_in": 0,
    "user": {
      "name": "string",
      "email": "string",
      "roles": [
        "string"
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|object|true|none||none|
|»» access_token|string|true|none||none|
|»» token_type|string|true|none||none|
|»» expires_in|integer|true|none||none|
|»» user|object|true|none||none|
|»»» name|string|true|none||none|
|»»» email|string|true|none||none|
|»»» roles|[string]|true|none||none|

## GET getProductsBySection

GET /api/admin/store-products/getBySection/{section_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|section_id|path|string| yes |none|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    null
  ],
  "meta": {
    "total": 0,
    "per_page": 0,
    "current_page": 0,
    "last_page": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» message|string|true|none||none|
|» data|[any]|true|none||none|
|» meta|object|true|none||none|
|»» total|integer|true|none||none|
|»» per_page|integer|true|none||none|
|»» current_page|integer|true|none||none|
|»» last_page|integer|true|none||none|

## GET show

GET /api/admin/store-products/show/{product_id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|product_id|path|string| yes |none|

> Response Examples

> 404 Response

```json
{
  "status": true,
  "message": "string",
  "data": null
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### Responses Data Schema

HTTP Status Code **404**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|boolean|true|none||none|
|» message|string|true|none||none|
|» data|null|true|none||none|

## GET index

GET /api/admin/store-products/index

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|string| no |none|
|per_page|query|string| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

# Data Schema

