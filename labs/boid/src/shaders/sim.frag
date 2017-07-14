// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

const int NUM = ${NUM};
const float PI = 3.141592653;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float time;
uniform float maxRadius;

void main(void) {
	vec3 pos        = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel        = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra      = texture2D(textureExtra, vTextureCoord).rgb;

	vec2 uvParticle;
	vec3 posParticle, velParticle;
	float _num = float(NUM);
	float dist, f, delta;
	vec3 dir;
	vec3 acc = vec3(0.0);

	const float minThreshold = 0.3;
	const float maxThreshold = 0.7;
	const float radius = 5.0;

	for(int i = 0; i < NUM; i++) {
		for(int j = 0; j < NUM; j++) {
			uvParticle = vec2(float(i)/_num, float(j)/_num);
			posParticle = texture2D(texturePos, uvParticle).xyz;

			dist = distance(pos, posParticle) / radius;

			//	ignore if distance is too far
			if(dist > radius) continue;

			//	ignore if distance is zero ( crash normalize )
			if(dist <= 0.0) continue;

			if(dist < minThreshold) {
				dir = normalize(pos - posParticle);
				delta = dist / minThreshold;
				f = 1.0 / delta;
				// acc += dir * f * 0.1;
			} else if(dist > maxThreshold) {
				dir = normalize(posParticle - pos);
				delta = (dist - maxThreshold) / (1.0 - maxThreshold);
				f = sin(delta * PI) * 0.1;
				acc += dir * f;
			}
		}
	}

	acc *= 0.01;
	vel += acc;


	const float decrease = .893;
	vel *= decrease;

	pos += vel;

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}