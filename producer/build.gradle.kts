plugins {
    java
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.apache.kafka", "kafka-clients", "2.5.0")
    implementation("com.github.javafaker", "javafaker", "1.0.2")
    implementation("com.fasterxml.jackson.core", "jackson-databind", "2.11.0")
    implementation("com.github.fge", "throwing-lambdas", "0.5.0")
}

configure<ApplicationPluginConvention> {
    mainClassName = "poc.Main"
}

val run by tasks.getting(JavaExec::class) {
    environment("KAFKA_BROKER_URL","localhost:9092")
    environment("KAFKA_TOPIC_NAME","test")
}
