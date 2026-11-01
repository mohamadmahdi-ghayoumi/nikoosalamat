<?php

declare(strict_types=1);

const VERSION_URL = 'https://github.com/mohamadmahdi-ghayoumi/nikoosalamat/releases/download/production/deploy-version.txt';
const PACKAGE_URL = 'https://github.com/mohamadmahdi-ghayoumi/nikoosalamat/releases/download/production/nikoosalamat-release.zip';

function download(string $url): string
{
    $url .= (str_contains($url, '?') ? '&' : '?') . 'cache=' . rawurlencode((string) time());

    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 20,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_USERAGENT => 'Nikoosalamat-cPanel-Deploy/1.0',
            CURLOPT_FAILONERROR => true,
        ]);
        $body = curl_exec($handle);
        if ($body === false) {
            $error = curl_error($handle);
            curl_close($handle);
            throw new RuntimeException('Download failed: ' . $error);
        }
        curl_close($handle);
        return $body;
    }

    $context = stream_context_create([
        'http' => [
            'follow_location' => 1,
            'timeout' => 120,
            'user_agent' => 'Nikoosalamat-cPanel-Deploy/1.0',
        ],
    ]);
    $body = file_get_contents($url, false, $context);
    if ($body === false) {
        throw new RuntimeException('Download failed.');
    }
    return $body;
}

function validateArchive(ZipArchive $archive): void
{
    for ($index = 0; $index < $archive->numFiles; $index++) {
        $name = $archive->getNameIndex($index);
        if (
            $name === false
            || str_contains($name, "\0")
            || str_contains($name, '\\')
            || preg_match('#(^/|(^|/)\.\.(/|$))#', $name)
        ) {
            throw new RuntimeException('Unsafe archive entry detected.');
        }
    }
}

$homeDirectory = __DIR__;
$publicDirectory = realpath($homeDirectory . '/public_html');
if ($publicDirectory === false || !is_dir($publicDirectory)) {
    fwrite(STDERR, "public_html was not found.\n");
    exit(1);
}

$lockHandle = fopen($homeDirectory . '/.nikoosalamat-deploy.lock', 'c');
if ($lockHandle === false || !flock($lockHandle, LOCK_EX | LOCK_NB)) {
    exit(0);
}

$stateFile = $homeDirectory . '/.nikoosalamat-deploy-version';
$temporaryArchive = $homeDirectory . '/.nikoosalamat-release.zip.tmp';

try {
    $remoteVersion = trim(download(VERSION_URL));
    if (!preg_match('/^[a-f0-9]{40}$/', $remoteVersion)) {
        throw new RuntimeException('Invalid deployment version.');
    }

    $currentVersion = is_file($stateFile) ? trim((string) file_get_contents($stateFile)) : '';
    if (hash_equals($remoteVersion, $currentVersion)) {
        echo "Already up to date: {$remoteVersion}\n";
        exit(0);
    }

    $package = download(PACKAGE_URL);
    if (strlen($package) < 1024 || file_put_contents($temporaryArchive, $package, LOCK_EX) === false) {
        throw new RuntimeException('The deployment package is invalid.');
    }

    if (!class_exists('ZipArchive')) {
        throw new RuntimeException('The PHP Zip extension is not enabled.');
    }

    $archive = new ZipArchive();
    if ($archive->open($temporaryArchive) !== true) {
        throw new RuntimeException('The deployment package could not be opened.');
    }

    validateArchive($archive);
    if (!$archive->extractTo($publicDirectory)) {
        $archive->close();
        throw new RuntimeException('The deployment package could not be extracted.');
    }
    $archive->close();

    if (file_put_contents($stateFile, $remoteVersion . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException('The deployment state could not be saved.');
    }

    echo "Deployed successfully: {$remoteVersion}\n";
} catch (Throwable $error) {
    fwrite(STDERR, '[' . date(DATE_ATOM) . '] ' . $error->getMessage() . PHP_EOL);
    exit(1);
} finally {
    if (is_file($temporaryArchive)) {
        unlink($temporaryArchive);
    }
    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);
}
