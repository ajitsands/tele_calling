<?php
$sampleDir = __DIR__ . '/../storage/recordings';
if (!is_dir($sampleDir)) {
    mkdir($sampleDir, 0777, true);
}

function createTelephoneWav($filename, $seconds = 6) {
    $sampleRate = 8000;
    $numChannels = 1;
    $bitsPerSample = 16;
    $byteRate = $sampleRate * $numChannels * ($bitsPerSample / 8);
    $blockAlign = $numChannels * ($bitsPerSample / 8);
    $numSamples = $sampleRate * $seconds;
    $dataSize = $numSamples * $blockAlign;
    $fileSize = 36 + $dataSize;

    $header = pack('a4Va4a4VvvVVvv',
        'RIFF', $fileSize, 'WAVE',
        'fmt ', 16, 1, $numChannels,
        $sampleRate, $byteRate, $blockAlign, $bitsPerSample
    );
    $dataHeader = pack('a4V', 'data', $dataSize);

    $samples = '';
    for ($i = 0; $i < $numSamples; $i++) {
        $t = $i / $sampleRate;
        // Dual-tone simulating telephone conversation voice audio
        $freq = 350 + 80 * sin(2 * M_PI * 1.5 * $t);
        $val = (int)(sin(2 * M_PI * $freq * $t) * 10000 * (0.8 + 0.2 * sin(2 * M_PI * 3 * $t)));
        $samples .= pack('v', $val);
    }

    file_put_contents($filename, $header . $dataHeader . $samples);
}

createTelephoneWav($sampleDir . '/sample_call_1.wav', 8);
createTelephoneWav($sampleDir . '/sample_call_2.wav', 6);
createTelephoneWav($sampleDir . '/sample_call_3.wav', 10);

copy($sampleDir . '/sample_call_1.wav', $sampleDir . '/sample_call_1.mp3');
copy($sampleDir . '/sample_call_2.wav', $sampleDir . '/sample_call_2.mp3');
copy($sampleDir . '/sample_call_3.wav', $sampleDir . '/sample_call_3.mp3');

echo "Audio samples successfully generated in $sampleDir\n";

