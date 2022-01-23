#version 410 core

in vec3 fPosition;
in vec3 fNormal;
in vec2 fTexCoords;
in vec3 lightPosEye;

out vec4 fColor;

//matrices
uniform mat4 model;
uniform mat4 view;
uniform mat3 normalMatrix;

//lighting
uniform vec3 lightDir;
uniform vec3 lightColor;
uniform int check;
uniform vec3 lightPos;

// textures
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

//components
vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;

float constant = 1.0f;
float linear = 0.0045f;
float quadratic = 0.0075f;


void computeDirLight()
{
    //compute eye space coordinates
    vec4 fPosEye = view * model * vec4(fPosition, 1.0f);
    vec3 normalEye = normalize(normalMatrix * fNormal);

    //normalize light direction
    vec3 lightDirN = vec3(normalize(view * vec4(lightDir, 0.0f)));

    //compute view direction (in eye coordinates, the viewer is situated at the origin
    vec3 viewDir = normalize(- fPosEye.xyz);

    //compute ambient light
    ambient = ambientStrength * lightColor;

    //compute diffuse light
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

    //compute specular light
    vec3 reflectDir = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDir, reflectDir), 0.0f), 32);
    specular = specularStrength * specCoeff * lightColor;
}

float computeFog(){
	vec4 fPosEye = view * model * vec4(fPosition, 1.0f);
    float fogDensity = 0.05f;
	//float fogDensity = 0.1f;
    float fragmentDistance = length(fPosEye);
	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
	return clamp(fogFactor, 0.0f, 1.0f);
	}



 void secondLight () {

	vec4 fPosEye = view * model * vec4(fPosition, 1.0f);
	vec3 normalEye = normalize(normalMatrix * fNormal);
	
	
	//normalize light direction
	vec3 lightDirN = vec3(normalize(view * vec4(lightDir, 0.0f)));
	
	//compute view direction
	vec3 viewDir = normalize(- fPosEye.xyz);
	
	//compute half vector
	vec3 halfVector = normalize(lightDirN + viewDir);
	
	//compute specular light
	float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), 32);
	specular = specularStrength * specCoeff * lightColor;

	//compute light direction
	//vec3 lightDirN = normalize(lightPosEye.xyz - fPosEye.xyz);
	
	//compute distance to light
	float dist = length(lightPosEye.xyz - fPosEye.xyz);
	
	//compute attenuation
	float att = 1.0f / (constant + linear * dist + quadratic * (dist * dist));
	
	//compute ambient light
	ambient = att * ambientStrength * lightColor;
	//compute diffuse light
	diffuse = att * max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	specular = att * specularStrength * specCoeff * lightColor;
	
}


void main() 
{

	if(check == 0)
		computeDirLight();
	else if(check == 1)
		secondLight();

    //compute final vertex color
    vec3 color = min((ambient + diffuse) * texture(diffuseTexture, fTexCoords).rgb + specular * texture(specularTexture, fTexCoords).rgb, 1.0f);
	
	float fogFactor = computeFog();
	vec4 fogColor = vec4(0.9f, 0.85f, 0.45f, 1.0f);
	fColor = mix(fogColor, vec4(color, 1.0f), fogFactor);

}
